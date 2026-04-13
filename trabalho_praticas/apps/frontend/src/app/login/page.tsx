'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, setToken, setUser, AuthUser } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    console.log('[LOGIN] form submitted with email:', email);
    setLoading(true);
    try {
      console.log('[LOGIN] calling apiFetch');
      const data = await apiFetch<{ token: string; user: AuthUser }>(
        '/api/v1/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password }) },
      );
      console.log('[LOGIN] success, received token and user:', data.user);
      setToken(data.token);
      setUser(data.user);
      if (rememberMe) {
        localStorage.setItem('rememberMe', email);
      }
      router.push('/dashboard');
    } catch (err: any) {
      console.error('[LOGIN] error:', err);
      setError(err.message ?? 'Falha no login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="absolute bottom-[5%] right-[5%] w-[30%] h-[30%] rounded-full bg-secondary-container/10 blur-[100px]"></div>
      </div>

      {/* Main Login Card */}
      <main className="w-full max-w-[440px]">
        {/* Branding Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary mb-6">
            <span className="material-symbols-outlined text-white text-2xl">architecture</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tighter text-on-surface mb-2">The Fluid Architect</h1>
          <p className="text-on-surface-variant font-medium tracking-tight">Your digital sanctuary for productivity.</p>
        </div>

        {/* Login Card */}
        <div className="bg-surface-container-lowest rounded-[2rem] p-10 shadow-lg shadow-primary/10 border border-outline-variant/20">
          {error && (
            <div className="mb-6 p-4 bg-error-container rounded-lg border border-error/30">
              <p className="text-error text-sm font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface-variant ml-1" htmlFor="email">
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </div>
                <input
                  id="email"
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-xl text-on-surface placeholder:text-outline/60 transition-all outline-none"
                  name="email"
                  placeholder="name@example.com"
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="block text-sm font-semibold text-on-surface-variant" htmlFor="password">
                  Password
                </label>
                <a className="text-xs font-bold text-primary hover:text-primary-container transition-colors" href="#">
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </div>
                <input
                  id="password"
                  className="w-full pl-12 pr-12 py-4 bg-surface-container-low border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-xl text-on-surface placeholder:text-outline/60 transition-all outline-none"
                  name="password"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="absolute inset-y-0 right-4 flex items-center text-outline hover:text-on-surface-variant transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-3 px-1">
              <input
                id="remember"
                className="w-5 h-5 rounded-md border-outline-variant text-primary focus:ring-primary/20 bg-surface-container-low cursor-pointer"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label className="text-sm font-medium text-on-surface-variant cursor-pointer" htmlFor="remember">
                Keep me signed in
              </label>
            </div>

            {/* Primary Action */}
            <button
              className="w-full bg-gradient-to-br from-primary to-primary-container text-white font-bold py-4 px-6 rounded-full text-lg shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              <span>{loading ? 'Signing in...' : 'Sign in'}</span>
              {!loading && (
                <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/20"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold text-outline-variant/60">
              <span className="bg-surface-container-lowest px-2">Or</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center text-sm text-on-surface-variant">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary font-bold hover:text-primary-container transition-colors">
              Create one
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
