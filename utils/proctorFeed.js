import { API_BASE_URL } from './config.js';
import { api } from './api.js';

// Close codes set by realtime/auth.py and realtime/consumers.py.
export const PROCTOR_CLOSE_UNAUTHORIZED = 4401;
export const PROCTOR_CLOSE_FORBIDDEN = 4403;

const REPORT_PAGE_SIZE = 100;
const REPORT_MAX_PAGES = 50;

// Trims fractional seconds to milliseconds so REST and socket timestamps compare equal.
const toMs = (iso) => Date.parse(String(iso).replace(/(\.\d{3})\d+/, '$1'));

// Socket rows carry client_event_id; REST rows carry event_id. Both carry seq/kind/t_server,
// so a row is a duplicate if any of its keys was already seen.
export const eventKeys = (e) => [
  e.client_event_id && `c:${e.client_event_id}`,
  e.event_id && `e:${e.event_id}`,
  `s:${e.seq}|${e.kind}|${toMs(e.t_server)}`,
].filter(Boolean);

export const mergeEvents = (existing, incoming) => {
  const seen = new Set(existing.flatMap(eventKeys));
  const added = [];
  for (const e of incoming) {
    const keys = eventKeys(e);
    if (keys.some((k) => seen.has(k))) continue;
    keys.forEach((k) => seen.add(k));
    added.push(e);
  }
  if (!added.length) return existing;
  return [...existing, ...added].sort((a, b) => toMs(a.t_server) - toMs(b.t_server) || a.seq - b.seq);
};

// REST report, all timeline pages. Each GET is written to the recruiter audit log server-side.
export const fetchProctorReport = async (sessionId) => {
  const path = `/ai-interviews/sessions/${sessionId}/proctor/report/`;
  const first = await api.get(path, { params: { page: 1, page_size: REPORT_PAGE_SIZE } });
  const events = [...(first.timeline?.results || [])];
  const total = first.timeline?.count ?? events.length;
  for (let page = 2; events.length < total && page <= REPORT_MAX_PAGES; page += 1) {
    const next = await api.get(path, { params: { page, page_size: REPORT_PAGE_SIZE } });
    const rows = next.timeline?.results || [];
    if (!rows.length) break;
    events.push(...rows);
  }
  return { report: first, events: mergeEvents([], events) };
};

// Socket URL is derived from the API origin; the realtime routes sit at the host root.
export const proctorSocketUrl = (sessionId) =>
  `${API_BASE_URL.replace(/\/+$/, '').replace(/^http/, 'ws')}/ws/proctoring/sessions/${sessionId}/`;

// Single-use ticket, valid for 30 s. Must be redeemed by sending the auth frame.
export const fetchRealtimeTicket = async () => {
  const { ticket } = await api.post('/realtime/ticket/', {});
  return ticket;
};
