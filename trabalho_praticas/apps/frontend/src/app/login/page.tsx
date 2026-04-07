'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, setToken, setUser, AuthUser } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

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
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #f4f6fb 0%, #e8edf8 100%)',
    }}>
      {/* Left branding panel */}
      <div style={{
        display: 'none',
        flex: '0 0 420px',
        background: 'var(--color-primary)',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '3rem',
        color: '#fff',
      }} className="md-panel">
        <div style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '1rem' }}>
          Tarefas
        </div>
        <p style={{ fontSize: '1.1rem', opacity: 0.85, lineHeight: 1.6 }}>
          Gerencie suas atividades com clareza.<br/>
          Produtividade sem sobrecarga.
        </p>
        <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {['Criação rápida de tarefas', 'Priorização visual', 'Dashboard de produtividade'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', opacity: 0.9 }}>
              <span style={{ background: 'rgba(255,255,255,.2)', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>✓</span>
              <span style={{ fontSize: '0.9375rem' }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '2rem',
      }}>
        <div className="card" style={{ width: '100%', maxWidth: 440, padding: '2.5rem' }}>
          {/* Logo para mobile */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.625rem', color: 'var(--color-primary)', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
              Tarefas
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Entre na sua conta
            </p>
          </div>

          {error && (
            <div style={{
              background: 'var(--color-error-bg)',
              border: '1px solid #fecaca',
              color: 'var(--color-error)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div>
              <label className="label" htmlFor="email">E-mail</label>
              <input
                id="email" className="input-field" type="email"
                placeholder="seu@email.com" required autoFocus
                value={email} onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="label" htmlFor="password">Senha</label>
              <input
                id="password" className="input-field" type="password"
                placeholder="••••••••" required
                value={password} onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit" className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.75rem' }}
              disabled={loading}
            >
              {loading ? (
                <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%' }} className="animate-spin" />
              ) : 'Entrar'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Não tem conta?{' '}
            <Link href="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
              Criar conta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
