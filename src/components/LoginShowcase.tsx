import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from './Icon';
import { fetchPublicStats, type PublicStats, type TopDestination } from '../services/publicStats';

// Panel de marca del login: fotos de los destinos mejor valorados del catálogo
// (con su ficha encima) y las cifras reales de lo publicado. Si la API no
// responde se queda con fotos genéricas y sin números: nunca cifras inventadas.

const unsplash = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=75`;
const FALLBACK: TopDestination[] = [
  'photo-1507525428034-b723cf961d3e', // playa
  'photo-1621407463298-5d499ada499d', // montaña
  'photo-1463592177119-bab2a00f3ccb', // cultura
].map((id) => ({ name: '', slug: '', image: unsplash(id), rating: 0, country: '', region: '', pois: 0 }));

const SLIDE_MS = 6500;

/** Cuenta de 0 al valor en ~1 s (solo la primera vez que llega). */
function useCountUp(target: number) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target) { setValue(0); return; }
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setValue(target); return; }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 1000);
      setValue(Math.round(target * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return value;
}

function Stat({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) {
  const n = useCountUp(value);
  return (
    <div>
      <div className="text-3xl font-semibold tabular-nums tracking-tight text-white">{n.toLocaleString()}{suffix}</div>
      <div className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.14em] text-white/60">{label}</div>
    </div>
  );
}

export default function LoginShowcase() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchPublicStats(ctrl.signal).then(setStats);
    return () => ctrl.abort();
  }, []);

  const slides = stats?.top_destinations?.length ? stats.top_destinations : FALLBACK;

  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => window.clearInterval(id);
  }, [slides.length]);

  const current = slides[index % slides.length];
  const c = stats?.counts;
  // Solo las cifras que existen: un «0 tours» en el login resta más que suma.
  const figures = c ? [
    { key: 'destinations', value: c.destinations },
    { key: 'pois', value: c.pois },
    { key: 'tours', value: c.tours },
    { key: 'countries', value: c.countries },
  ].filter((f) => f.value > 0).slice(0, 3) : [];

  return (
    <aside className="relative hidden w-[48%] overflow-hidden bg-slate-950 text-white lg:block">
      {/* Fotos en fundido con zoom lento */}
      {slides.map((s, i) => (
        <img
          key={s.image}
          src={s.image}
          alt=""
          loading={i === 0 ? 'eager' : 'lazy'}
          className={`absolute inset-0 h-full w-full object-cover ease-out ${
            i === index % slides.length ? 'scale-110 opacity-100' : 'scale-100 opacity-0'
          }`}
          style={{ transitionProperty: 'opacity, transform', transitionDuration: `1500ms, ${SLIDE_MS + 1500}ms` }}
        />
      ))}
      {/* Velos para leer el texto sobre cualquier foto */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/30 to-slate-950/95" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 to-transparent" />

      <div className="relative flex h-full flex-col justify-between p-12 xl:p-14">
        {/* Marca */}
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-950/50">
            <Icon name="compass" className="h-6 w-6 text-white" />
          </span>
          <div className="leading-tight">
            <p className="text-lg font-semibold tracking-tight">Backpacking Buzz</p>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-300">{t('login.partnerPortal')}</p>
          </div>
        </div>

        {/* Mensaje + cifras */}
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-emerald-100 backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> {t('login.badge')}
          </span>
          <h2 className="mt-6 whitespace-pre-line text-4xl font-semibold leading-[1.12] tracking-tight drop-shadow-sm xl:text-[2.9rem]">
            {t('login.tagline')}
          </h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-white/75">{t('login.taglineSub')}</p>

          {figures.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/15 pt-6">
              {figures.map((f) => <Stat key={f.key} value={f.value} label={t(`login.stats.${f.key}`)} />)}
              {stats && stats.average_rating > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-3xl font-semibold tabular-nums tracking-tight">
                    {stats.average_rating.toFixed(1)} <Icon name="star" className="h-6 w-6 text-amber-300" />
                  </div>
                  <div className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.14em] text-white/60">{t('login.stats.rating')}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ficha del destino de la foto + lo que hace un socio */}
        <div className="space-y-5">
          {current.name && (
            <div className="flex items-end justify-between gap-4">
              <div key={current.name} className="rounded-2xl border border-white/15 bg-white/10 p-4 pr-6 backdrop-blur-md">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">{t('login.topDestination')}</p>
                <p className="mt-1 text-lg font-semibold leading-tight">{current.name}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/75">
                  {(current.country || current.region) && (
                    <span className="inline-flex items-center gap-1"><Icon name="pin" className="h-3.5 w-3.5" /> {[current.region, current.country].filter(Boolean).join(' · ')}</span>
                  )}
                  {current.rating > 0 && (
                    <span className="inline-flex items-center gap-1"><Icon name="star" className="h-3.5 w-3.5 text-amber-300" /> {current.rating.toFixed(1)}</span>
                  )}
                  {current.pois > 0 && (
                    <span className="inline-flex items-center gap-1"><Icon name="landmark" className="h-3.5 w-3.5" /> {t('login.placesCount', { count: current.pois })}</span>
                  )}
                </div>
              </div>
              {slides.length > 1 && (
                <div className="flex gap-1.5 pb-2" role="tablist" aria-label={t('login.topDestination')}>
                  {slides.map((s, i) => (
                    <button key={s.image} type="button" onClick={() => setIndex(i)} aria-label={s.name || String(i + 1)}
                      aria-selected={i === index % slides.length} role="tab"
                      className={`h-1.5 rounded-full transition-all ${i === index % slides.length ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'}`} />
                  ))}
                </div>
              )}
            </div>
          )}

          <ul className="grid grid-cols-2 gap-2 xl:grid-cols-4">
            {(['tours', 'pois', 'company', 'bookings'] as const).map((key, i) => (
              <li key={key} className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2.5 text-xs font-medium text-white/85 backdrop-blur-sm">
                <Icon name={['ticket', 'pin', 'building', 'chart-bar'][i]} className="h-4 w-4 shrink-0 text-emerald-300" />
                {t(`login.features.${key}.title`)}
              </li>
            ))}
          </ul>

          <p className="flex items-center gap-2 text-xs text-white/55">
            <Icon name="shield" className="h-4 w-4 text-emerald-400" /> {t('login.moderationNote')}
          </p>
        </div>
      </div>
    </aside>
  );
}
