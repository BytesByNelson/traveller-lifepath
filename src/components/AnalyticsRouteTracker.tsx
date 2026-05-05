import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    goatcounter?: {
      count?: (opts: { path: string; title?: string; event?: boolean }) => void;
      no_onload?: boolean;
    };
  }
}

/**
 * Pings GoatCounter on every client-side route change. This app uses HashRouter,
 * so the browser only fires a single native page-load event for the SPA shell;
 * without this, every wizard step, sheet view, and list visit would collapse into
 * a single pageview in analytics. Anonymous, no PII — just the route path.
 *
 * The path we report is the route path (e.g. `/create/:id` template, not the
 * literal id) so analytics doesn't accidentally turn into a per-character index.
 */
export function AnalyticsRouteTracker() {
  const { pathname } = useLocation();
  const lastReported = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.goatcounter || typeof window.goatcounter.count !== 'function') return;
    const path = anonymisePath(pathname);
    if (path === lastReported.current) return;
    lastReported.current = path;
    window.goatcounter.count({ path });
  }, [pathname]);

  return null;
}

/**
 * Replace UUIDs in the path with `:id` so e.g. /create/abc-1234 → /create/:id.
 * Keeps the analytics dashboard readable instead of generating a unique row per
 * character.
 */
const anonymisePath = (pathname: string): string => {
  return pathname.replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id');
};
