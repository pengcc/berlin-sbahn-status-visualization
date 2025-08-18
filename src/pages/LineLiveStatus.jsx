import { useEffect, useMemo, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
  Paper,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import {
  getAllSuburbanLines,
  getLineWithRemarks,
  getRunningTripsByLineName,
  summarizeTrips,
  parseSevFromTrip,
  getJourneySnapshot,
} from '@/api/vbbClient';

/** Utility: normalize/keep only disruption-like remarks */
function extractLiveIssues(remarks = []) {
  const issues = [];
  for (const r of remarks) {
    const cat = (r.category || r.type || '').toLowerCase();
    const txt = (r.text || r.summary || '').toString();
    const isDisruption =
      cat.includes('disruption') ||
      cat.includes('issue') ||
      cat.includes('warning') ||
      /störung|ausfall|sperr|disruption|delay|verspät/i.test(txt);
    if (isDisruption) {
      issues.push({
        id: r.id || r.code || Math.random().toString(36).slice(2),
        summary: r.summary || r.text || 'Hinweis',
        text: r.text || r.summary || '',
        category: r.category || r.type || 'disruption',
        validFrom: r.validFrom,
        validUntil: r.validUntil,
      });
    }
  }
  return issues;
}

function StatusChip({ lineName, delaySec = 0, cancelled = false, hasIssues = false, sev = false }) {
  if (cancelled || hasIssues || sev) {
    return (
      <Chip
        icon={<DoNotDisturbIcon />}
        color='error'
        variant='filled'
        label={`${lineName} – ${sev ? 'Ersatzverkehr' : 'Störung / Ausfall'}`}
      />
    );
  }
  if (delaySec > 120) {
    return (
      <Chip
        icon={<AccessTimeIcon />}
        color='warning'
        variant='filled'
        label={`${lineName} – Verspätung ~${Math.round(delaySec / 60)} min`}
      />
    );
  }
  if (delaySec > 0) {
    return (
      <Chip
        icon={<AccessTimeIcon />}
        color='warning'
        variant='outlined'
        label={`${lineName} – +${Math.round(delaySec / 60)} min`}
      />
    );
  }
  return (
    <Chip
      icon={<CheckCircleIcon />}
      color='success'
      variant='outlined'
      label={`${lineName} – Pünktlich`}
    />
  );
}

const LineLiveStatus = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const timerRef = useRef(null);

  const refresh = async () => {
    setError(null);
    setLoading(true);
    try {
      const baseLines = await getAllSuburbanLines();

      // Deduplicate by short name (S1, S2, S25, ...)
      const byName = new Map();
      for (const l of baseLines) {
        const key = l.name; // e.g., S41, S5
        if (!byName.has(key)) byName.set(key, l);
      }
      const slim = Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name, 'de'));

      const enriched = await Promise.all(
        slim.map(async (l) => {
          // Fetch currently running trips for the line short name
          const trips = await getRunningTripsByLineName(l.name);

          // Basic delay from trips (top-level delays)
          const { maxDelay } = summarizeTrips(trips);

          // SEV detection & remark
          let sev = false;
          let sevNote = null;
          for (const t of trips) {
            const s = parseSevFromTrip(t);
            if (s.sev) {
              sev = true;
              sevNote = s.sevRemark || 'Ersatzverkehr';
              break;
            }
          }

          // Journey snapshot for more precise realtime + remarks (use the first trip's OD if available)
          let jDelay = 0;
          let jRemarks = [];
          if (trips.length > 0) {
            const first = trips[0];
            const fromId = first?.origin?.id;
            const toId = first?.destination?.id;
            if (fromId && toId) {
              const snap = await getJourneySnapshot(fromId, toId);
              if (snap) {
                jDelay = Math.max(jDelay, snap.delay || 0);
                jRemarks = snap.remarks || [];
              }
            }
          }

          // Also try line-level remarks when we already suspect an issue, to save API calls otherwise
          let lineRemarks = [];
          if (sev || maxDelay > 0 || jDelay > 0) {
            try {
              const detailed = await getLineWithRemarks(l.id);
              lineRemarks = detailed?.remarks || [];
            } catch (err) {
              console.warn(`remarks fetch failed for ${l.name}:`, err);
            }
          }

          const combinedRemarks = extractLiveIssues([
            ...(sevNote ? [{ text: sevNote }] : []),
            ...jRemarks,
            ...lineRemarks,
          ]);

          return {
            id: l.id,
            name: l.name,
            remarks: combinedRemarks,
            maxDelay: Math.max(maxDelay, jDelay),
            cancelled: combinedRemarks.some((m) =>
              /ausfall|fällt aus|cancel/i.test(m.text || m.summary || '')
            ),
            sev,
          };
        })
      );

      setRows(enriched);
      setLastUpdated(new Date());
    } catch (e) {
      console.error(e);
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    timerRef.current = setInterval(refresh, 60000);
    return () => clearInterval(timerRef.current);
  }, []);

  const anyIssues = useMemo(
    () => rows.some((r) => r.remarks?.length || r.cancelled || r.sev || r.maxDelay > 0),
    [rows]
  );

  return (
    <Box>
      <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ mb: 1 }}>
        <Typography variant='h6'>Live S‑Bahn Linienstatus</Typography>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant='body1' gutterBottom>
            This page shows real-time status information for Berlin S-Bahn lines using the{' '}
            <strong>VBB transport REST API</strong> (
            <a href='https://v6.vbb.transport.rest/' target='_blank' rel='noopener noreferrer'>
              v6.vbb.transport.rest
            </a>
            ).
          </Typography>
          <Typography variant='body2'>
            For official disruption information, always check the{' '}
            <a
              href='https://sbahn.berlin/fahren/bauen-stoerung/'
              target='_blank'
              rel='noopener noreferrer'
            >
              S-Bahn Berlin website
            </a>{' '}
            or{' '}
            <a href='https://x.com/SBahnBerlin' target='_blank' rel='noopener noreferrer'>
              @SBahnBerlin on X
            </a>
            .
          </Typography>
          {/* Switch to historical dashboard */}
          <Button component={RouterLink} to='/analytics' variant='contained' color='primary'>
            View Historical Analytics
          </Button>
        </Paper>
        <Stack direction='row' spacing={1} alignItems='center'>
          {lastUpdated && (
            <Tooltip title={lastUpdated.toLocaleString()}>
              <Typography variant='caption'>
                Aktualisiert:{' '}
                {new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(
                  lastUpdated
                )}
              </Typography>
            </Tooltip>
          )}
          <Tooltip title='Jetzt aktualisieren'>
            <IconButton onClick={refresh} size='small'>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ p: 2 }}>
          <Typography color='error' variant='body2'>
            Fehler beim Laden: {error}
          </Typography>
        </Box>
      ) : (
        <List dense>
          {rows.map((r) => (
            <Box key={r.name}>
              <ListItem sx={{ py: 1.5 }}>
                <ListItemText
                  primary={
                    <Stack direction='row' spacing={1} alignItems='center'>
                      <Typography variant='subtitle1' sx={{ minWidth: 48, fontWeight: 600 }}>
                        {r.name}
                      </Typography>
                      <StatusChip
                        lineName={r.name}
                        delaySec={r.maxDelay}
                        cancelled={r.cancelled}
                        hasIssues={!!r.remarks?.length}
                        sev={r.sev}
                      />
                    </Stack>
                  }
                  secondary={
                    r.remarks?.length
                      ? `${r.remarks[0].summary || r.remarks[0].text}`
                      : r.maxDelay > 0
                        ? `Max. beobachtete Verspätung ~${Math.round(r.maxDelay / 60)} min`
                        : 'Keine Hinweise'
                  }
                />
              </ListItem>

              <Accordion disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant='body2'>Details & Hinweise</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={1}>
                    {r.remarks?.length ? (
                      r.remarks.map((m) => (
                        <Stack key={m.id} spacing={0.5}>
                          <Stack direction='row' spacing={1} alignItems='center'>
                            <WarningAmberIcon fontSize='small' />
                            <Typography variant='subtitle2'>{m.summary || 'Hinweis'}</Typography>
                          </Stack>
                          {m.text && (
                            <Typography variant='body2' color='text.secondary'>
                              {m.text}
                            </Typography>
                          )}
                          <Typography variant='caption' color='text.secondary'>
                            {m.validFrom ? `ab ${new Date(m.validFrom).toLocaleString()}` : ''}
                            {m.validUntil
                              ? ` • bis ${new Date(m.validUntil).toLocaleString()}`
                              : ''}
                          </Typography>
                          <Divider sx={{ my: 1 }} />
                        </Stack>
                      ))
                    ) : (
                      <Typography variant='body2' color='text.secondary'>
                        Keine aktuellen Hinweise gemeldet.
                      </Typography>
                    )}

                    {r.maxDelay > 0 || r.cancelled ? (
                      <Stack direction='row' spacing={1} alignItems='center'>
                        <AccessTimeIcon fontSize='small' />
                        <Typography variant='body2'>
                          Max. beobachtete Verspätung: ~{Math.round(r.maxDelay / 60)} min{' '}
                          {r.cancelled ? ' • Ausfälle beobachtet' : ''}
                        </Typography>
                      </Stack>
                    ) : null}
                  </Stack>
                </AccordionDetails>
              </Accordion>

              <Divider />
            </Box>
          ))}
        </List>
      )}

      {!loading && !error && (
        <Stack direction='row' spacing={1} alignItems='center' sx={{ mt: 1 }}>
          <Typography variant='caption' color={anyIssues ? 'warning.main' : 'success.main'}>
            {anyIssues
              ? 'Es liegen Hinweise/Verspätungen vor.'
              : 'Alle Linien ohne gemeldete Hinweise.'}
          </Typography>
        </Stack>
      )}
    </Box>
  );
};

export default LineLiveStatus;
