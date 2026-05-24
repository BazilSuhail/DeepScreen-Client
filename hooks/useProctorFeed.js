'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  PROCTOR_CLOSE_FORBIDDEN, fetchProctorReport, fetchRealtimeTicket, mergeEvents, proctorSocketUrl,
} from '@/utils/proctorFeed';

const MAX_RETRIES = 6;
const backoffMs = (n) => Math.min(30000, 1000 * 2 ** n);

// REST report first, then live events from the socket. The socket is open only while mounted.
// live: connecting | live | reconnecting | refused | unavailable
export default function useProctorFeed(sessionId) {
  const [report, setReport] = useState(null);
  const [events, setEvents] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [live, setLive] = useState('connecting');
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!sessionId) return undefined;
    let closed = false;
    let token = 0; // invalidates snapshot and socket callbacks from superseded connections
    let socket = null;
    let timer = null;
    let retries = 0;
    let snapshotReady = false;
    let buffer = []; // socket events that arrive before the REST snapshot has been applied

    const scheduleRetry = () => {
      if (closed) return;
      if (retries >= MAX_RETRIES) {
        setLive('unavailable');
        return;
      }
      setLive('reconnecting');
      timer = setTimeout(connect, backoffMs(retries));
      retries += 1;
    };

    // Re-fetched on every connect so events missed while the socket was down are picked up.
    const applySnapshot = async (my) => {
      try {
        const snap = await fetchProctorReport(sessionId);
        if (closed || my !== token) return;
        setReport(snap.report);
        setEvents(mergeEvents(snap.events, buffer));
        setLoadError('');
      } catch (e) {
        if (closed || my !== token) return;
        console.error(e);
        setLoadError('We could not load the proctoring report. Try again.');
        setEvents((prev) => mergeEvents(prev, buffer));
      } finally {
        if (!closed && my === token) {
          buffer = [];
          snapshotReady = true;
        }
      }
    };

    const connect = async () => {
      const my = ++token;
      snapshotReady = false;
      buffer = [];
      let ticket;
      try {
        ticket = await fetchRealtimeTicket();
      } catch (e) {
        console.error(e);
        scheduleRetry();
        return;
      }
      if (closed || my !== token) return;

      socket = new WebSocket(proctorSocketUrl(sessionId));
      socket.onopen = () => {
        // The first frame must be the auth frame. It is the only frame this client ever sends.
        socket.send(JSON.stringify({ type: 'auth', ticket }));
        setLive('live');
        applySnapshot(my);
      };
      socket.onmessage = (msg) => {
        let data;
        try {
          data = JSON.parse(msg.data);
        } catch {
          return;
        }
        if (data?.type !== 'proctor.event' || !Array.isArray(data.events)) return;
        retries = 0;
        if (!snapshotReady) buffer.push(...data.events);
        else setEvents((prev) => mergeEvents(prev, data.events));
      };
      socket.onclose = (e) => {
        socket = null;
        if (closed || my !== token) return;
        if (e.code === PROCTOR_CLOSE_FORBIDDEN) {
          setLive('refused');
          return;
        }
        scheduleRetry();
      };
    };

    connect();

    return () => {
      closed = true;
      clearTimeout(timer);
      if (socket) {
        socket.onopen = null;
        socket.onmessage = null;
        socket.onclose = null;
        socket.close();
      }
    };
  }, [sessionId, nonce]);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  return { report, events, loadError, live, refresh };
}
