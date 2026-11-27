import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { disableAnalytics, initAnalytics, trackPageView } from '../services/analytics';
import { onConsentChange } from '../services/consent';

/**
 * Emite un page_view de GA4 en cada cambio de ruta. Se monta dentro del Router
 * y no pinta nada. Sin VITE_GA_MEASUREMENT_ID, o sin el consentimiento de
 * cookies de analítica, no hace absolutamente nada.
 */
export default function AnalyticsTracker() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    initAnalytics();
    // Aceptar en el banner carga GA en el acto (y cuenta la página actual);
    // rechazar después de haber aceptado lo apaga y borra sus cookies.
    return onConsentChange((c) => {
      if (c.analytics) {
        initAnalytics();
        trackPageView(window.location.pathname + window.location.search);
      } else {
        disableAnalytics();
      }
    });
  }, []);
  useEffect(() => { trackPageView(pathname + search); }, [pathname, search]);

  return null;
}
