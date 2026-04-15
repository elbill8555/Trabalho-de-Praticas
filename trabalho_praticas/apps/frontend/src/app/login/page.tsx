'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, setToken, setUser, AuthUser } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiFetch<{ token: string; user: AuthUser }>(
        '/api/v1/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password }) },
      );
      setToken(data.token);
      setUser(data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message ?? 'Falha no login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  }

  return (
    /* ── Stitch Login Prototype ──────────────────────────────────
       bg-surface, items-center, justify-center, p-6
       ─────────────────────────────────────────────────────────── */
    <div style={{
      minHeight: '100vh',
      background: '#f8f9fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* ── Background decorative blurs (Stitch prototype) ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-10%', left: '-10%',
          width: '40%', height: '40%',
          borderRadius: '9999px',
          background: 'rgba(0,63,135,0.05)',
          filter: 'blur(120px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '5%', right: '5%',
          width: '30%', height: '30%',
          borderRadius: '9999px',
          background: 'rgba(191,210,253,0.10)',
          filter: 'blur(100px)',
        }} />
      </div>

      {/* ── Main canvas ── */}
      <main style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>

        {/* ── Branding Header ── */}
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          {/* Logo icon */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 48, height: 48, borderRadius: '0.75rem',
            background: '#003f87',
            marginBottom: '1.5rem',
          }}>
            <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '24px' }}>
              architecture
            </span>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.875rem', fontWeight: 800,
            letterSpacing: '-0.03em', color: '#191c1d',
            marginBottom: '0.5rem',
          }}>
            The Fluid Architect
          </h1>
          <p style={{ color: '#424752', fontWeight: 500, letterSpacing: '-0.01em' }}>
            O seu santuário digital de produtividade.
          </p>
        </div>

        {/* ── Login Card ── */}
        <div style={{
          background: '#ffffff',
          borderRadius: '2rem',
          padding: '2.5rem',
          boxShadow: '0px 20px 40px rgba(0,63,135,0.06)',
          border: '1px solid rgba(194,198,212,0.10)',
        }}>
          {/* Error banner */}
          {error && (
            <div style={{
              background: '#ffdad6', color: '#ba1a1a',
              borderRadius: '0.75rem', padding: '0.75rem 1rem',
              fontSize: '0.875rem', marginBottom: '1.5rem',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* ── Email ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="label" htmlFor="email">Email</label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', top: 0, bottom: 0, left: '1rem',
                  display: 'flex', alignItems: 'center', pointerEvents: 'none',
                  color: '#727784',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>mail</span>
                </div>
                <input
                  id="email"
                  className="input-field"
                  type="email"
                  placeholder="nome@exemplo.com"
                  required
                  autoFocus
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* ── Password ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '0.25rem', paddingRight: '0.25rem' }}>
                <label className="label" htmlFor="password" style={{ marginBottom: 0 }}>Senha</label>
                <a href="#" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#003f87' }}>
                  Esqueci minha senha
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', top: 0, bottom: 0, left: '1rem',
                  display: 'flex', alignItems: 'center', pointerEvents: 'none',
                  color: '#727784',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>lock</span>
                </div>
                <input
                  id="password"
                  className="input-field"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  style={{
                    position: 'absolute', top: 0, bottom: 0, right: '1rem',
                    display: 'flex', alignItems: 'center',
                    color: '#727784', background: 'transparent', border: 'none', cursor: 'pointer',
                  }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {showPwd ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* ── Primary Action — rounded-full, gradient, py-4 ── */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #003f87 0%, #0056b3 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '1.0625rem',
                padding: '1rem 1.5rem',
                borderRadius: '9999px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'opacity 0.15s, transform 0.1s',
                boxShadow: '0 8px 24px rgba(0,63,135,0.10)',
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.opacity = '0.90'; }}
              onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
              onMouseDown={e  => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)'; }}
              onMouseUp={e    => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
            >
              {loading ? (
                <span style={{
                  width: 20, height: 20,
                  border: '2px solid rgba(255,255,255,.35)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                }} className="animate-spin" />
              ) : (
                <>
                  <span>Entrar</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* ── Divider ── */}
          <div style={{ position: 'relative', margin: '2.5rem 0' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '100%', borderTop: '1px solid rgba(194,198,212,0.20)' }} />
            </div>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <span style={{
                background: '#ffffff', padding: '0 1rem',
                fontSize: '0.6875rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.2em',
                color: '#727784',
              }}>
                Ou continue com
              </span>
            </div>
          </div>

          {/* ── Social Login ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { label: 'Google', icon: 'language' },
              { label: 'Apple',  icon: 'apple' },
            ].map(({ label, icon }) => (
              <button key={label} type="button" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                border: '1px solid rgba(194,198,212,0.30)',
                background: 'transparent',
                fontWeight: 600, fontSize: '0.875rem',
                color: '#424752',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#f3f4f5'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Footer — link "Criar conta" ── */}
        <p style={{ textAlign: 'center', marginTop: '2.5rem', color: '#424752', fontWeight: 500 }}>
          Ainda não tem uma conta?{' '}
          <Link href="/register" style={{ color: '#003f87', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '4px', textDecorationThickness: '2px' }}>
            Criar conta
          </Link>
        </p>

        {/* ── Terms ── */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p style={{
            fontSize: '0.625rem', textTransform: 'uppercase',
            letterSpacing: '0.2em', fontWeight: 700,
            color: 'rgba(114,119,132,0.6)',
            lineHeight: 1.6, padding: '0 2rem',
          }}>
            Ao continuar, você concorda com nossos{' '}
            <a href="#" style={{ color: 'inherit' }}>Termos de Serviço</a> e{' '}
            <a href="#" style={{ color: 'inherit' }}>Política de Privacidade</a>.
          </p>
        </div>
      </main>
    </div>
  );
}
