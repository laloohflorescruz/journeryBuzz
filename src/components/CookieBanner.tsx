import { useEffect, useState } from 'react';
import { getConsent, onOpenCookieSettings, setConsent } from '../services/consent';
import { analyticsEnabled } from '../services/analytics';

// Banner de consentimiento de cookies del panel (mismo criterio que el portal):
// solo con analítica configurada y mientras no se haya decidido; «Aceptar» y
// «Rechazar» pesan lo mismo. Se reabre desde «Preferencias de cookies».

const PRIVACY_URL = `${(import.meta.env.VITE_PORTAL_URL ?? 'https://www.journery.com').replace(/\/$/, '')}/privacy-policy`;

export default function CookieBanner() {
  const [open, setOpen] = useState(() => analyticsEnabled() && getConsent() === null);
  useEffect(() => onOpenCookieSettings(() => setOpen(analyticsEnabled())), []);
  if (!open) return null;

  const decide = (analytics: boolean) => { setConsent(analytics); setOpen(false); };
  const current = getConsent();

  return (
    <div role="dialog" aria-live="polite" aria-label="Preferencias de cookies"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:inset-x-6 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">Tu privacidad</p>
          <p className="mt-1">
            Usamos cookies necesarias para que el panel funcione y, si aceptas, cookies de analítica (Google Analytics) para saber qué pantallas se usan y mejorarlas. No las usamos para publicidad.{' '}
            <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-emerald-700 underline-offset-2 hover:underline">Política de privacidad</a>
          </p>
          {current && <p className="mt-1 text-xs text-slate-400">Ahora: analítica {current.analytics ? 'aceptada' : 'rechazada'}.</p>}
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => decide(false)}
            className="flex-1 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-900 sm:flex-none">
            Rechazar
          </button>
          <button type="button" onClick={() => decide(true)}
            className="flex-1 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 sm:flex-none">
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
