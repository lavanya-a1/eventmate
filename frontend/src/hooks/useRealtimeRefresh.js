import { useEffect, useRef } from 'react';
import api from '../api/axios';

function getApiOrigin() {
  const base = api.defaults.baseURL || '/api';
  if (/^https?:\/\//i.test(base)) {
    return base.replace(/\/$/, '');
  }
  return `${window.location.origin}${base.startsWith('/') ? '' : '/'}${base}`.replace(/\/$/, '');
}

export function useRealtimeRefresh({ enabled = true, onRefresh, eventTypes, throttleMs = 1200 }) {
  const lastRefreshRef = useRef(0);
  const queuedRefreshRef = useRef(null);

  useEffect(() => {
    if (!enabled || typeof onRefresh !== 'function') return undefined;

    const origin = getApiOrigin();
    const url = `${origin}/realtime/stream`;
    const source = new EventSource(url, { withCredentials: true });

    const allowed = Array.isArray(eventTypes) && eventTypes.length ? new Set(eventTypes) : null;

    const runRefresh = () => {
      const now = Date.now();
      const elapsed = now - lastRefreshRef.current;

      if (elapsed >= throttleMs) {
        lastRefreshRef.current = now;
        onRefresh();
        return;
      }

      if (queuedRefreshRef.current) return;
      queuedRefreshRef.current = window.setTimeout(() => {
        queuedRefreshRef.current = null;
        lastRefreshRef.current = Date.now();
        onRefresh();
      }, throttleMs - elapsed);
    };

    const onUpdate = (evt) => {
      try {
        const payload = JSON.parse(evt.data || '{}');
        if (allowed && !allowed.has(payload.type)) return;
      } catch {
        // Ignore malformed event payloads and still trigger refresh.
      }
      runRefresh();
    };

    source.addEventListener('update', onUpdate);

    return () => {
      source.removeEventListener('update', onUpdate);
      source.close();
      if (queuedRefreshRef.current) {
        clearTimeout(queuedRefreshRef.current);
        queuedRefreshRef.current = null;
      }
    };
  }, [enabled, onRefresh, eventTypes, throttleMs]);
}
