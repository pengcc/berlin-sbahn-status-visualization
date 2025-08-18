export const API_BASE = 'https://v6.vbb.transport.rest';

/** Generic JSON fetch with timeout & error surface */
async function fetchJSON(url, { timeout = 15000, ...opts } = {}) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { signal: ctrl.signal, ...opts });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${res.statusText} — ${text}`);
    }
    return await res.json();
  } finally {
    clearTimeout(id);
  }
}

/** Get all Berlin suburban (S‑Bahn) lines (operator=1) */
export async function getAllSuburbanLines() {
  const url = `${API_BASE}/lines?operator=1&variants=false&product=suburban`;
  const list = await fetchJSON(url);
  return list.map((l) => ({ id: l.id, name: l.name, product: l.product, operator: l.operator }));
}

/** Get a single line with remarks (disruptions, warnings) */
export async function getLineWithRemarks(lineId) {
  const url = `${API_BASE}/lines/${encodeURIComponent(lineId)}?remarks=true`;
  return await fetchJSON(url);
}

/** Fetch currently running trips for a line short name (e.g. "S41").
 *  We pass both query= and lineName= as you observed.
 */
export async function getRunningTripsByLineName(lineShortName) {
  const enc = encodeURIComponent(lineShortName);
  const url = `${API_BASE}/trips?query=${enc}&onlyCurrentlyRunning=true&lineName=${enc}&stopovers=false&remarks=true&subStops=false&entrances=true&language=en`;
  try {
    const data = await fetchJSON(url);
    if (Array.isArray(data)) return data; // just in case
    if (Array.isArray(data?.trips)) return data.trips;
    return [];
  } catch (e) {
    console.warn(`trips fetch failed for ${lineShortName}:`, e);
    return [];
  }
}

/** Heuristics: detect SEV (replacement bus) & extract a readable remark */
export function parseSevFromTrip(t) {
  const l = t?.line || {};
  const remarks = t?.remarks || [];
  const sevByMode = l.product && l.product !== 'suburban';
  const sevByAdmin = typeof l.adminCode === 'string' && l.adminCode.startsWith('SEV');
  let sevRemark = null;
  for (const r of remarks) {
    const txt = (r.text || r.summary || '').toString();
    if (r.code === 'EV' || /ersatzverkehr|SEV|replacement bus/i.test(txt)) {
      sevRemark = txt || 'Ersatzverkehr';
      break;
    }
  }
  return { sev: !!(sevByMode || sevByAdmin || sevRemark), sevRemark };
}

/** Ask for a journey between two stops to get reliable realtime delays & remarks */
export async function getJourneySnapshot(fromId, toId) {
  const url = `${API_BASE}/journeys?from=${fromId}&to=${toId}&remarks=true&results=1&stopovers=false&subStops=false&entrances=true&language=en`;
  try {
    const data = await fetchJSON(url);
    const j = data?.journeys?.[0];
    if (!j) return null;
    const leg = j.legs?.[0];
    let delay = 0;
    if (Number.isFinite(leg?.departureDelay)) delay = Math.max(delay, leg.departureDelay);
    if (Number.isFinite(leg?.arrivalDelay)) delay = Math.max(delay, leg.arrivalDelay);
    const remarks = leg?.remarks || j.remarks || [];
    let cancelled = false;
    for (const r of remarks) {
      const txt = (r.text || r.summary || '').toString();
      if (/ausfall|fällt aus|cancel/i.test(txt)) cancelled = true;
    }
    return { delay, remarks, refreshToken: j.refreshToken, cancelled };
  } catch (e) {
    console.warn(`journey snapshot failed ${fromId}->${toId}:`, e);
    return null;
  }
}

/** Aggregate simple delays from trips (top-level delays) */
export function summarizeTrips(trips) {
  let maxDelay = 0;
  for (const t of trips || []) {
    if (Number.isFinite(t.departureDelay)) maxDelay = Math.max(maxDelay, t.departureDelay);
    if (Number.isFinite(t.arrivalDelay)) maxDelay = Math.max(maxDelay, t.arrivalDelay);
  }
  return { maxDelay };
}
