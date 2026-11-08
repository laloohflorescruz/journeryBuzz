import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { apiErrorMessage } from '../lib/apiError';
import Icon from '../components/Icon';
import LoginShowcase from '../components/LoginShowcase';

// «¿Olvidaste tu contraseña?» del portal de socios.
//   /forgot-password → pide el correo (POST /auth/password-reset/, portal=partners)
//   /reset-password?uid=…&token=… → enlace del correo; fija la contraseña nueva
// La API responde igual exista o no la cuenta, así que aquí tampoco se distingue.

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15';
const primaryButton =
  'flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none';

/** Mismo marco que el login: panel de marca + columna del formulario. */
const AuthShell: React.FC<{ eyebrow: string; title: string; subtitle: string; children: React.ReactNode }> = ({
  eyebrow, title, subtitle, children,
}) => {
  const { t, i18n } = useTranslation();
  const toggleLanguage = () => i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es');
  return (
    <div className="flex min-h-screen bg-white">
      <LoginShowcase />
      <main className="flex flex-1 flex-col bg-slate-50/60">
        <div className="flex items-center justify-between p-6">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
            <Icon name="arrow-left" className="h-4 w-4" /> {t('passwordReset.backToLogin')}
          </Link>
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
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">{eyebrow}</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
              <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-7">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const ErrorBox: React.FC<{ message: string }> = ({ message }) => (
  <div role="alert" className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5">
    <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
    <p className="text-sm text-rose-700">{message}</p>
  </div>
);

const Spinner = () => <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />;

export const ForgotPassword: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const valid = /^\S+@\S+\.\S+$/.test(email.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/password-reset/', { email: email.trim(), portal: 'partners' });
      setSent(true);
    } catch (err) {
      setError(apiErrorMessage(err, t('passwordReset.genericError')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell eyebrow={t('login.partnerPortal')} title={t('passwordReset.forgotTitle')} subtitle={t('passwordReset.forgotSubtitle')}>
      {sent ? (
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
            <Icon name="mail" className="h-6 w-6 text-emerald-600" />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">{t('passwordReset.sentTitle')}</h2>
          <p className="mt-2 text-sm text-slate-500">{t('passwordReset.sentText', { email: email.trim() })}</p>
          <p className="mt-4 text-xs text-slate-400">{t('passwordReset.sentHint')}</p>
          <Link to="/login" className={`${primaryButton} mt-6`}>{t('passwordReset.backToLogin')}</Link>
        </div>
      ) : (
        <>
          {error && <ErrorBox message={error} />}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">{t('passwordReset.email')}</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon name="mail" className="h-4 w-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                  className={inputClass}
                  placeholder={t('passwordReset.emailPlaceholder')}
                />
              </div>
            </div>
            <button type="submit" disabled={loading || !valid} className={primaryButton}>
              {loading ? <><Spinner /> {t('passwordReset.sending')}</> : t('passwordReset.sendLink')}
            </button>
          </form>
        </>
      )}
    </AuthShell>
  );
};

export const ResetPassword: React.FC = () => {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const uid = params.get('uid') ?? '';
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const tooShort = password.length > 0 && password.length < 8;
  const mismatch = confirm.length > 0 && confirm !== password;
  const canSubmit = password.length >= 8 && confirm === password && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/password-reset-confirm/', { uid, token, new_password: password });
      setDone(true);
    } catch (err) {
      setError(apiErrorMessage(err, t('passwordReset.genericError')));
    } finally {
      setLoading(false);
    }
  };

  if (!uid || !token) {
    return (
      <AuthShell eyebrow={t('login.partnerPortal')} title={t('passwordReset.invalidTitle')} subtitle={t('passwordReset.invalidText')}>
        <Link to="/forgot-password" className={primaryButton}>{t('passwordReset.requestNew')}</Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell eyebrow={t('login.partnerPortal')} title={t('passwordReset.resetTitle')} subtitle={t('passwordReset.resetSubtitle')}>
      {done ? (
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
            <Icon name="check-circle" className="h-6 w-6 text-emerald-600" />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">{t('passwordReset.doneTitle')}</h2>
          <p className="mt-2 text-sm text-slate-500">{t('passwordReset.doneText')}</p>
          <Link to="/login" className={`${primaryButton} mt-6`}>{t('login.signIn')}</Link>
        </div>
      ) : (
        <>
          {error && (
            <>
              <ErrorBox message={error} />
              <p className="-mt-3 mb-5 text-xs text-slate-500">
                <Link to="/forgot-password" className="font-semibold text-emerald-700 hover:underline">{t('passwordReset.requestNew')}</Link>
              </p>
            </>
          )}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium text-slate-700">{t('passwordReset.newPassword')}</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon name="lock" className="h-4 w-4" />
                </span>
                <input
                  id="new-password"
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  autoFocus
                  className={`${inputClass} pr-12`}
                  placeholder={t('passwordReset.newPasswordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? t('login.hidePassword') : t('login.showPassword')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                >
                  <Icon name={show ? 'close' : 'eye'} className="h-4 w-4" />
                </button>
              </div>
              {tooShort && <p className="mt-1.5 text-xs font-medium text-amber-600">{t('passwordReset.tooShort')}</p>}
            </div>
            <div>
              <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-slate-700">{t('passwordReset.confirmPassword')}</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon name="lock" className="h-4 w-4" />
                </span>
                <input
                  id="confirm-password"
                  type={show ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  className={inputClass}
                  placeholder={t('passwordReset.confirmPlaceholder')}
                />
              </div>
              {mismatch && <p className="mt-1.5 text-xs font-medium text-amber-600">{t('passwordReset.mismatch')}</p>}
            </div>
            <button type="submit" disabled={!canSubmit} className={primaryButton}>
              {loading ? <><Spinner /> {t('passwordReset.saving')}</> : t('passwordReset.save')}
            </button>
          </form>
        </>
      )}
    </AuthShell>
  );
};
