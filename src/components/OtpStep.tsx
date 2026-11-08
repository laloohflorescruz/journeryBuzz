import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { OTPChallenge } from '../context/AuthContext';
import { apiErrorMessage } from '../lib/apiError';
import Icon from './Icon';

interface Props {
  otp: OTPChallenge;
  /** Valida el código; si lanza, se muestra el error de la API. */
  onVerify: (code: string) => Promise<void>;
  /** Pide un código nuevo y devuelve el reto que lo sustituye. */
  onResend: () => Promise<OTPChallenge>;
  /** Volver al usuario y contraseña. */
  onCancel: () => void;
}

/** Segundo paso del login: código de 6 dígitos enviado al correo del socio. */
const OtpStep: React.FC<Props> = ({ otp, onVerify, onResend, onCancel }) => {
  const { t } = useTranslation();
  const digits = otp.digits || 6;
  const [values, setValues] = useState<string[]>(() => Array(digits).fill(''));
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [expired, setExpired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(otp.resend_in);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => { inputs.current[0]?.focus(); }, []);
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  const submit = async (code: string) => {
    if (code.length !== digits || loading) return;
    setError('');
    setInfo('');
    setLoading(true);
    try {
      await onVerify(code);
    } catch (err) {
      const data = (err as { response?: { data?: { expired?: boolean } } }).response?.data;
      setExpired(!!data?.expired);
      setError(apiErrorMessage(err, t('otp.genericError')));
      setValues(Array(digits).fill(''));
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const fill = (start: number, text: string) => {
    const clean = text.replace(/\D/g, '');
    if (!clean) return;
    const next = [...values];
    for (let i = 0; i < clean.length && start + i < digits; i += 1) next[start + i] = clean[i];
    setValues(next);
    const focusAt = Math.min(start + clean.length, digits - 1);
    inputs.current[focusAt]?.focus();
    const code = next.join('');
    if (code.length === digits) submit(code);
  };

  const onChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (!v) {
      const next = [...values];
      next[i] = '';
      setValues(next);
      return;
    }
    fill(i, v.slice(-digits));
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !values[i] && i > 0) {
      inputs.current[i - 1]?.focus();
      const next = [...values];
      next[i - 1] = '';
      setValues(next);
    } else if (e.key === 'ArrowLeft' && i > 0) {
      inputs.current[i - 1]?.focus();
    } else if (e.key === 'ArrowRight' && i < digits - 1) {
      inputs.current[i + 1]?.focus();
    }
  };

  const onPaste = (i: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    fill(i, e.clipboardData.getData('text'));
  };

  const resend = async () => {
    setError('');
    setInfo('');
    setResending(true);
    try {
      const fresh = await onResend();
      setCooldown(fresh.resend_in);
      setExpired(false);
      setValues(Array(digits).fill(''));
      setInfo(t('otp.resent', { email: fresh.email_hint }));
      inputs.current[0]?.focus();
    } catch (err) {
      const data = (err as { response?: { data?: { expired?: boolean } } }).response?.data;
      setExpired(!!data?.expired);
      setError(apiErrorMessage(err, t('otp.genericError')));
    } finally {
      setResending(false);
    }
  };

  const code = values.join('');

  return (
    <div>
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
          <Icon name="mail" className="h-5 w-5 text-emerald-600" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-900">{t('otp.title')}</h2>
          <p className="mt-0.5 text-sm text-slate-500">{t('otp.subtitle', { email: otp.email_hint })}</p>
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5">
          <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
          <p className="text-sm text-rose-700">{error}</p>
        </div>
      )}
      {info && !error && (
        <div role="status" className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5">
          <Icon name="check-circle" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <p className="text-sm text-emerald-800">{info}</p>
        </div>
      )}

      {expired ? (
        <button type="button" onClick={onCancel}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-800">
          {t('otp.restart')}
        </button>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); submit(code); }} noValidate>
          <fieldset disabled={loading} className="flex justify-between gap-2" aria-label={t('otp.codeLabel')}>
            {values.map((v, i) => (
              <input
                key={i}
                ref={(el) => { inputs.current[i] = el; }}
                value={v}
                onChange={(e) => onChange(i, e)}
                onKeyDown={(e) => onKeyDown(i, e)}
                onPaste={(e) => onPaste(i, e)}
                onFocus={(e) => e.target.select()}
                inputMode="numeric"
                autoComplete={i === 0 ? 'one-time-code' : 'off'}
                maxLength={digits}
                aria-label={t('otp.digit', { n: i + 1 })}
                className="h-12 w-full min-w-0 rounded-xl border border-slate-300 bg-white text-center text-xl font-semibold text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 disabled:opacity-60 sm:h-14"
              />
            ))}
          </fieldset>

          <button
            type="submit"
            disabled={loading || code.length !== digits}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            {loading
              ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> {t('otp.verifying')}</>
              : t('otp.verify')}
          </button>

          <div className="mt-4 flex items-center justify-between text-xs">
            <button type="button" onClick={onCancel} className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-slate-900">
              <Icon name="arrow-left" className="h-3.5 w-3.5" /> {t('otp.back')}
            </button>
            {cooldown > 0 ? (
              <span className="text-slate-400">{t('otp.resendIn', { s: cooldown })}</span>
            ) : (
              <button type="button" onClick={resend} disabled={resending}
                className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline disabled:opacity-50">
                {resending ? t('otp.resending') : t('otp.resend')}
              </button>
            )}
          </div>
        </form>
      )}

      <p className="mt-5 text-[11px] leading-relaxed text-slate-400">{t('otp.hint', { minutes: Math.max(1, Math.round(otp.expires_in / 60)) })}</p>
    </div>
  );
};

export default OtpStep;
