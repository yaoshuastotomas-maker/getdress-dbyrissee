import React, { useState } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { Lock, User, ArrowLeft, KeyRound, Eye, EyeOff, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';

export const AdminLoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();
  const { actualTheme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const from = (location.state as any)?.from?.pathname || '/admin';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!usernameOrEmail.trim() || !password) {
      setErrorMsg('Please enter both username/email and password.');
      return;
    }

    setLoading(true);

    try {
      await login(usernameOrEmail.trim(), password);
      success('Welcome back, Rissée! Owner workspace unlocked.');
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err.message || 'Invalid username or password. Please verify your credentials.';
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-stone-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      
      {/* Return to Public Website & Theme Switcher */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-6 flex items-center justify-between">
        <Link
          to="/"
          id="back-to-boutique-link"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Boutique</span>
        </Link>

        <button
          type="button"
          onClick={() => setTheme(actualTheme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
          title="Toggle light/dark theme"
          aria-label="Toggle theme"
        >
          {actualTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-5 h-5 text-[#dfc8b4]" />
          </div>
          <h1 className="font-serif text-3xl font-medium text-stone-900 dark:text-stone-100">
            Owner Management Portal
          </h1>
          <p className="text-xs tracking-wider uppercase text-stone-500 dark:text-stone-400">
            Get Dress'd by Rissée
          </p>
        </div>

        <div className="bg-white dark:bg-stone-900 py-8 px-6 sm:px-10 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xl space-y-6">
          {errorMsg && (
            <div
              id="login-error-alert"
              role="alert"
              className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-medium"
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" id="owner-login-form">
            <div>
              <label
                htmlFor="username-or-email"
                className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5"
              >
                Owner Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="username-or-email"
                  type="text"
                  autoComplete="username"
                  required
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="Enter your username or email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="owner-password"
                className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="owner-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-500"
                />
                <button
                  type="button"
                  id="toggle-password-visibility"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="owner-login-submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold uppercase tracking-widest hover:bg-stone-800 dark:hover:bg-white shadow transition-all disabled:opacity-50 mt-2"
            >
              {loading ? 'Verifying Credentials...' : 'Sign In to Workspace'}
            </button>
          </form>

          {/* Secure Portal Indicator */}
          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-center gap-2 text-stone-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Authenticated SSL Session • Boutique Owner Portal</span>
          </div>
        </div>
      </div>
    </div>
  );
};

