import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initAnalytics, trackPageView } from '../services/analytics';

/**
 * Emite un page_view de GA4 en cada cambio de ruta. Se monta dentro del Router
 * y no pinta nada. Sin VITE_GA_MEASUREMENT_ID no hace absolutamente nada.
 */
export default function AnalyticsTracker() {
  const { pathname, search } = useLocation();

  useEffect(() => { initAnalytics(); }, []);
  useEffect(() => { trackPageView(pathname + search); }, [pathname, search]);

  return null;
}
