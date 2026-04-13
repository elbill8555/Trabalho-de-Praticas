'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, setToken, setUser, AuthUser } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    console.log('[REGISTER] form submitted with:', { name, email });
    if (password !== confirm) { 
      setError('As senhas não coincidem.'); 
      console.log('[REGISTER] passwords do not match');
      return; 
    }
    if (password.length < 8)  { 
      setError('A senha deve ter ao menos 8 caracteres.'); 
      console.log('[REGISTER] password too short');
      return; 
    }

    setLoading(true);
    try {
      console.log('[REGISTER] calling apiFetch for registration');
      const data = await apiFetch<{ token: string; user: AuthUser }>(
        '/api/v1/auth/register',
        { method: 'POST', body: JSON.stringify({ name, email, password }) },
      );
      console.log('[REGISTER] success, received token and user:', data.user);
      setToken(data.token);
      setUser(data.user);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('[REGISTER] error:', err);
      setError(err.message ?? 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '2rem',
      background: 'linear-gradient(135deg, #f4f6fb 0%, #e8edf8 100%)',
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 440, padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.625rem', color: 'var(--color-primary)', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
            Criar conta
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Comece a organizar sua produtividade
          </p>
        </div>

        {error && (
          <div style={{
            background: 'var(--color-error-bg)', border: '1px solid #fecaca',
            color: 'var(--color-error)', borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem', fontSize: '0.875rem', marginBottom: '1.25rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          <div>
            <label className="label" htmlFor="name">Nome</label>
            <input id="name" className="input-field" type="text"
              placeholder="Seu nome completo" required autoFocus
              value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="email">E-mail</label>
            <input id="email" className="input-field" type="email"
              placeholder="seu@email.com" required
              value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="password">Senha</label>
            <input id="password" className="input-field" type="password"
              placeholder="Mínimo 8 caracteres" required minLength={8}
              value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="confirm">Confirmar senha</label>
            <input id="confirm" className="input-field" type="password"
              placeholder="Repita a senha" required
              value={confirm} onChange={e => setConfirm(e.target.value)} />
          </div>

          <button
            type="submit" className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.75rem' }}
            disabled={loading}
          >
            {loading ? (
              <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%' }} className="animate-spin" />
            ) : 'Criar conta'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          Já tem conta?{' '}
          <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
}
