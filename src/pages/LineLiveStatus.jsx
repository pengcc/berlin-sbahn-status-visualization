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
        label={`${lineName} – ${Math.round(delaySec / 60)} min`}
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
  const [loading, setLoading] = useState(true); // initial load indicator
  const [refreshing, setRefreshing] = useState(false); // background refresh indicator
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const timerRef = useRef(null);
  const ongoingRef = useRef(false);

  const refresh = async (background = false) => {
    // prevent overlapping refreshes
    if (ongoingRef.current) return;
    ongoingRef.current = true;

    // If we already have rows, treat this as background refresh by default
    const isBackground = background || rows.length > 0;

    if (isBackground) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    // keep previous rows visible while loading in background
    if (!isBackground) {
      setError(null);
    }

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

          // Journey snapshot for more precise realtime  remarks (use the first trip's OD if available)
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

      // Only update rows when new data is ready (keeps UI stable during fetch)
      setRows(enriched);
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      console.error(e);
      // keep previous rows on error; show message
      setError(e.message || String(e));
    } finally {
      ongoingRef.current = false;
      if (isBackground) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // initial load (non-background)
    refresh(false);
    // auto-refresh every 10 minutes
    timerRef.current = setInterval(() => refresh(true), 10 * 60 * 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const anyIssues = useMemo(
    () => rows.some((r) => r.remarks?.length || r.cancelled || r.sev || r.maxDelay > 0),
    [rows]
  );

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 1.5, sm: 2 }}
        alignItems='center'
        justifyContent='space-between'
        sx={{ mb: 2 }}
      >
        <Typography
          variant='h6'
          sx={{
            fontWeight: 700,
            width: { xs: '100%', sm: 'auto' },
            textAlign: { xs: 'center', sm: 'left' },
            fontSize: { xs: '1rem', md: '1.25rem' },
          }}
        >
          Live S‑Bahn Linienstatus
        </Typography>

        <Box
          sx={{
            width: { xs: '100%', sm: 'auto' },
            display: 'flex',
            justifyContent: { xs: 'center', sm: 'center' },
            px: { xs: 0, sm: 1 },
          }}
        >
          <Button
            component={RouterLink}
            to='/analytics'
            variant='contained'
            color='primary'
            size='small'
            sx={{ whiteSpace: 'nowrap' }}
          >
            View Historical Analytics
          </Button>
        </Box>

        <Box
          sx={{
            width: { xs: '100%', sm: 'auto' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: { xs: 'center', sm: 'flex-end' },
            gap: 1,
          }}
        >
          {lastUpdated && (
            <Tooltip title={lastUpdated.toLocaleString()}>
              <Typography
                variant='caption'
                sx={{ textAlign: { xs: 'center', sm: 'right' }, minWidth: 110 }}
              >
                Aktualisiert:{' '}
                {new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(
                  lastUpdated
                )}
              </Typography>
            </Tooltip>
          )}
          <Tooltip title='Jetzt aktualisieren'>
            <span>
              <IconButton
                onClick={() => refresh(true)}
                size='small'
                disabled={refreshing || loading}
                aria-label='refresh'
              >
                {refreshing ? <CircularProgress size={18} /> : <RefreshIcon />}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
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
