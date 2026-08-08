import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const next = {};
    if (!email.trim()) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email address';
    if (!password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setAuthError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      const user = await login({ email, password, rememberMe });
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
      // eslint-disable-next-line no-unused-vars
      void user;
    } catch (err) {
      if (err.response?.status === 401) {
        setAuthError('Incorrect email or password. Check your details and try again.');
      } else {
        setAuthError('Sign-in is unavailable right now. Please try again in a moment.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleForgotSubmit(e) {
    e.preventDefault();
    // No backend endpoint wired for this in Phase 1 - UI flow only for now.
    setForgotSent(true);
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 h-11 w-11 rounded-lg bg-primary flex items-center justify-center text-white font-display text-lg">
            L&D
          </div>
          <h1 className="font-display text-2xl text-ink">Demand, Inventory & Procurement Optimiser</h1>
          <p className="text-sm text-muted mt-1">Sign in to your enterprise L&D workspace</p>
        </div>

        <div className="bg-surface border border-border rounded-lg shadow-sm p-6">
          {!forgotMode ? (
            <form onSubmit={handleSubmit} noValidate>
              {authError && (
                <div
                  role="alert"
                  className="mb-4 flex items-start gap-2 rounded-md bg-status-criticalBg text-status-critical text-sm px-3 py-2.5"
                >
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className={`w-full rounded-md border px-3 py-2 text-sm mb-1 outline-none focus:ring-2 focus:ring-primary/30 ${
                  errors.email ? 'border-status-critical' : 'border-border'
                }`}
                placeholder="you@company.com"
              />
              {errors.email && (
                <p id="email-error" className="text-xs text-status-critical mb-3">{errors.email}</p>
              )}
              {!errors.email && <div className="mb-3" />}

              <label htmlFor="password" className="block text-sm font-medium text-ink mb-1.5">
                Password
              </label>
              <div className="relative mb-1">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  className={`w-full rounded-md border px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary/30 ${
                    errors.password ? 'border-status-critical' : 'border-border'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-xs text-status-critical mb-3">{errors.password}</p>
              )}
              {!errors.password && <div className="mb-3" />}

              <div className="flex items-center justify-between mb-5">
                <label className="flex items-center gap-2 text-sm text-ink/80">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary/30"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => setForgotMode(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-md bg-primary text-white text-sm font-medium py-2.5 hover:bg-primary-dark disabled:opacity-70 transition-colors"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? 'Signing in…' : 'Sign in'}
              </button>

              <p className="mt-5 text-xs text-muted text-center">
                Demo accounts: admin@demo.local · planner@demo.local · procurement@demo.local
                <br />Password: Password123!
              </p>
            </form>
          ) : (
            <div>
              {!forgotSent ? (
                <form onSubmit={handleForgotSubmit}>
                  <h2 className="font-display text-lg text-ink mb-1">Reset your password</h2>
                  <p className="text-sm text-muted mb-4">
                    Enter your work email and we'll send a reset link.
                  </p>
                  <label htmlFor="forgot-email" className="block text-sm font-medium text-ink mb-1.5">
                    Email
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border border-border px-3 py-2 text-sm mb-4 outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="you@company.com"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-md bg-primary text-white text-sm font-medium py-2.5 hover:bg-primary-dark"
                  >
                    Send reset link
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotMode(false)}
                    className="w-full mt-2 text-sm text-muted hover:text-ink py-2"
                  >
                    Back to sign in
                  </button>
                </form>
              ) : (
                <div className="text-center py-2">
                  <p className="font-display text-lg text-ink mb-1">Check your email</p>
                  <p className="text-sm text-muted mb-4">
                    If an account exists for {email}, a reset link is on its way.
                  </p>
                  <button
                    onClick={() => { setForgotMode(false); setForgotSent(false); }}
                    className="text-sm text-primary hover:underline"
                  >
                    Back to sign in
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
