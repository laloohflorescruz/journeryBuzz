import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/', { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Invalid credentials. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute top-1/2 -right-32 w-80 h-80 bg-white/5 rounded-full" />
          <div className="absolute -bottom-16 left-1/3 w-64 h-64 bg-white/5 rounded-full" />
        </div>

        <div className="relative">
          <div className="flex items-center space-x-3">
            <span className="text-4xl">🏢</span>
            <span className="text-white text-2xl font-bold tracking-tight">Backpacking Buzz</span>
          </div>
        </div>

        <div className="relative">
          <h2 className="text-white text-4xl font-bold leading-tight mb-4 whitespace-pre-line">
            {t('login.tagline')}
          </h2>
          <p className="text-blue-200 text-lg leading-relaxed">
            {t('login.taglineSub')}
          </p>
        </div>

        <div className="relative flex items-center space-x-6">
          <div className="text-center">
            <div className="text-white text-2xl font-bold">500+</div>
            <div className="text-blue-200 text-sm">{t('login.statsPOIs')}</div>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center">
            <div className="text-white text-2xl font-bold">120+</div>
            <div className="text-blue-200 text-sm">{t('login.statsProviders')}</div>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center">
            <div className="text-white text-2xl font-bold">45+</div>
            <div className="text-blue-200 text-sm">{t('login.statsTours')}</div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <span className="text-5xl">🏢</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-3">Backpacking Buzz</h1>
          </div>

          <div className="mb-8 flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{t('login.welcomeBack')}</h2>
              <p className="text-gray-500 mt-1">{t('login.signInAccount')}</p>
            </div>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-lg transition-colors font-medium mt-1"
              title={t('common.language')}
            >
              🌐 {i18n.language === 'es' ? 'ES' : 'EN'}
            </button>
          </div>

          {error && (
            <div className="mb-6 flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <span className="text-red-500 mt-0.5 shrink-0">⚠️</span>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('login.username')}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg select-none">
                  👤
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  autoFocus
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder-gray-400"
                  placeholder={t('login.enterUsername')}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('login.password')}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg select-none">
                  🔒
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder-gray-400"
                  placeholder={t('login.enterPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-sm select-none"
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>{t('common.signingIn')}</span>
                </>
              ) : (
                <span>{t('login.signIn')}</span>
              )}
            </button>
          </form>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => { setUsername('superadmin'); setPassword('Admin2026!'); }}
              className="w-full py-2.5 border border-dashed border-gray-300 rounded-xl text-xs text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>⚡</span>
              <span>Acceso rápido — superadmin</span>
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-center text-xs text-gray-400">
              🔐 {t('login.accessRestricted')}<br />
              {t('login.contactAdmin')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
