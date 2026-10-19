import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { apiErrorMessage } from '../lib/apiError';
import { canAccessBuzz } from '../lib/access';
import Icon from '../components/Icon';

// Portal público: allí está el alta de empresas («Quiero ser socio»).
const PORTAL_URL = (import.meta.env.VITE_PORTAL_URL ?? 'https://www.journery.com').replace(/\/$/, '');

// Lo que un socio hace en Buzz: es el argumento del panel de bienvenida.
const FEATURES = [
  { icon: 'ticket', key: 'tours' },
  { icon: 'pin', key: 'pois' },
  { icon: 'building', key: 'company' },
  { icon: 'chart-bar', key: 'bookings' },
] as const;

const Login: React.FC = () => {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Vuelve a la sección que el socio intentaba abrir antes de iniciar sesión.
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(username.trim(), password);
      // Buzz es para socios y equipo de la plataforma; un viajero no tiene panel aquí.
      if (!canAccessBuzz(user)) {
        await logout();
        setError(t('login.onlyPartners'));
        return;
      }
      navigate(from === '/login' ? '/' : from, { replace: true });
    } catch (err) {
      // Sin respuesta = red/CORS/servidor caído; con respuesta = credenciales u otro.
      const status = (err as { response?: { status?: number } }).response?.status;
      setError(status == null
        ? t('login.networkError')
        : apiErrorMessage(err, status === 401 ? t('login.invalidCredentials') : t('login.serverError', { status })));
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => setCapsLock(e.getModifierState?.('CapsLock') ?? false);
  const toggleLanguage = () => i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es');
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-screen bg-white">
      {/* ── Panel de marca ── */}
      <aside className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-slate-950 p-12 text-white lg:flex xl:p-16">
        {/* Retícula y halos: profundidad sin imágenes */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse at 30% 40%, #000 30%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 30% 40%, #000 30%, transparent 75%)',
          }}
        />
        <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-sky-500/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-900/40">
            <Icon name="compass" className="h-6 w-6 text-white" />
          </span>
          <div className="leading-tight">
            <p className="text-lg font-semibold tracking-tight">Backpacking Buzz</p>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-300/80">{t('login.partnerPortal')}</p>
          </div>
        </div>

        <div className="relative max-w-lg">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-emerald-200 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {t('login.badge')}
          </span>
          <h2 className="mt-6 whitespace-pre-line text-4xl font-semibold leading-[1.15] tracking-tight xl:text-5xl">
            {t('login.tagline')}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-300">{t('login.taglineSub')}</p>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <li key={f.key} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300">
                  <Icon name={f.icon} className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-white">{t(`login.features.${f.key}.title`)}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-slate-400">{t(`login.features.${f.key}.text`)}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-3 text-xs text-slate-400">
          <Icon name="shield" className="h-4 w-4 text-emerald-400" />
          <span>{t('login.moderationNote')}</span>
        </div>
      </aside>

      {/* ── Formulario ── */}
      <main className="flex flex-1 flex-col bg-slate-50/60">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-2.5 lg:invisible">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600">
              <Icon name="compass" className="h-5 w-5 text-white" />
            </span>
            <span className="text-sm font-semibold text-slate-900">Backpacking Buzz</span>
          </div>
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-900"
            title={t('common.language')}
          >
            <Icon name="globe" className="h-4 w-4" /> {i18n.language === 'es' ? 'Español' : 'English'}
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-10">
          <div className="w-full max-w-[25rem]">
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">{t('login.partnerPortal')}</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{t('login.welcomeBack')}</h1>
              <p className="mt-2 text-sm text-slate-500">{t('login.signInAccount')}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-7">
              {error && (
                <div role="alert" className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5">
                  <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                  <p className="text-sm text-rose-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div>
                  <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-slate-700">{t('login.username')}</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Icon name="user" className="h-4 w-4" />
                    </span>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      autoComplete="username"
                      autoFocus
                      className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
                      placeholder={t('login.enterUsername')}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">{t('login.password')}</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Icon name="lock" className="h-4 w-4" />
                    </span>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyUp={onKey}
                      onKeyDown={onKey}
                      required
                      autoComplete="current-password"
                      className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-12 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
                      placeholder={t('login.enterPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                      title={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    >
                      <Icon name={showPassword ? 'close' : 'eye'} className="h-4 w-4" />
                    </button>
                  </div>
                  {capsLock && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-amber-600">
                      <Icon name="info" className="h-3.5 w-3.5" /> {t('login.capsLock')}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !username.trim() || !password}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      {t('common.signingIn')}
                    </>
                  ) : (
                    <>
                      {t('login.signIn')}
                      <Icon name="arrow-right" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <Icon name="shield" className="h-3.5 w-3.5" /> {t('login.secureNote')}
              </p>
            </div>

            {/* Alta de nuevos socios: vive en el portal público */}
            <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-dashed border-slate-300 bg-white/70 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">{t('login.notPartner')}</p>
                <p className="text-xs text-slate-500">{t('login.notPartnerSub')}</p>
              </div>
              <a
                href={`${PORTAL_URL}/register-business`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                {t('login.becomePartner')} <Icon name="arrow-right" className="h-3.5 w-3.5" />
              </a>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400">{t('login.help')}</p>
          </div>
        </div>

        <p className="pb-6 text-center text-[11px] text-slate-400">© {year} Backpacking Buzz · {t('login.partnerPortal')}</p>
      </main>
    </div>
  );
};

export default Login;
