'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, setToken, setUser, AuthUser } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('As senhas não coincidem.'); return; }
    if (password.length < 8)  { setError('A senha deve ter ao menos 8 caracteres.'); return; }
    setLoading(true);
    try {
      const data = await apiFetch<{ token: string; user: AuthUser }>(
        '/api/v1/auth/register',
        { method: 'POST', body: JSON.stringify({ name, email, password }) },
      );
      setToken(data.token);
      setUser(data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message ?? 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  }

  const fields: { id: string; label: string; type: string; placeholder: string; icon: string; value: string; set: (v: string) => void }[] = [
    { id: 'name',     label: 'Nome',            type: 'text',     placeholder: 'Seu nome completo',   icon: 'person',   value: name,     set: setName },
    { id: 'email',    label: 'Email',            type: 'email',    placeholder: 'nome@exemplo.com',    icon: 'mail',     value: email,    set: setEmail },
    { id: 'password', label: 'Senha',            type: 'password', placeholder: 'Mínimo 8 caracteres', icon: 'lock',     value: password, set: setPassword },
    { id: 'confirm',  label: 'Confirmar senha',  type: 'password', placeholder: 'Repita a senha',      icon: 'lock',     value: confirm,  set: setConfirm },
  ];

  return (
    <div style={{
      minHeight: '100vh', background: '#f8f9fa',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem', position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative blurs */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-10%', right: '-5%',
          width: '35%', height: '35%', borderRadius: '9999px',
          background: 'rgba(0,63,135,0.05)', filter: 'blur(120px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '5%', left: '5%',
          width: '30%', height: '30%', borderRadius: '9999px',
          background: 'rgba(191,210,253,0.10)', filter: 'blur(100px)',
        }} />
      </div>

      <main style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        {/* Branding */}
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 48, height: 48, borderRadius: '0.75rem',
            background: '#003f87', marginBottom: '1.5rem',
          }}>
            <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '24px' }}>architecture</span>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-heading)', fontSize: '1.875rem',
            fontWeight: 800, letterSpacing: '-0.03em',
            color: '#191c1d', marginBottom: '0.5rem',
          }}>
            Criar conta
          </h1>
          <p style={{ color: '#424752', fontWeight: 500, letterSpacing: '-0.01em' }}>
            Comece sua jornada de produtividade.
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#ffffff', borderRadius: '2rem', padding: '2.5rem',
          boxShadow: '0px 20px 40px rgba(0,63,135,0.06)',
          border: '1px solid rgba(194,198,212,0.10)',
        }}>
          {error && (
            <div style={{
              background: '#ffdad6', color: '#ba1a1a',
              borderRadius: '0.75rem', padding: '0.75rem 1rem',
              fontSize: '0.875rem', marginBottom: '1.5rem',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {fields.map(({ id, label, type, placeholder, icon, value, set }, i) => (
              <div key={id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label className="label" htmlFor={id}>{label}</label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute', top: 0, bottom: 0, left: '1rem',
                    display: 'flex', alignItems: 'center', pointerEvents: 'none',
                    color: '#727784',
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{icon}</span>
                  </div>
                  <input
                    id={id}
                    className="input-field"
                    type={type}
                    placeholder={placeholder}
                    required
                    autoFocus={i === 0}
                    minLength={id === 'password' || id === 'confirm' ? 8 : undefined}
                    value={value}
                    onChange={e => set(e.target.value)}
                  />
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', marginTop: '0.5rem',
                background: 'linear-gradient(135deg, #003f87 0%, #0056b3 100%)',
                color: '#ffffff', fontWeight: 700, fontSize: '1.0625rem',
                padding: '1rem 1.5rem', borderRadius: '9999px',
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
                  border: '2px solid rgba(255,255,255,.35)', borderTopColor: '#fff',
                  borderRadius: '50%',
                }} className="animate-spin" />
              ) : (
                <>
                  <span>Criar conta</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '2.5rem', color: '#424752', fontWeight: 500 }}>
          Já tem uma conta?{' '}
          <Link href="/login" style={{ color: '#003f87', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '4px', textDecorationThickness: '2px' }}>
            Entrar
          </Link>
        </p>

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
