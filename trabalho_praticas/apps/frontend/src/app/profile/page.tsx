'use client';

import { useState, FormEvent } from 'react';
import AppLayout from '@/components/AppLayout';
import { apiFetch, getUser, setUser, clearAuth, AuthUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const user   = getUser();
  const [name, setName]           = useState(user?.name ?? '');
  const [savingName, setSavingName] = useState(false);
  const [nameMsg, setNameMsg]     = useState('');

  const [oldPwd, setOldPwd]   = useState('');
  const [newPwd, setNewPwd]   = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [savingPwd, setSavingPwd]   = useState(false);
  const [pwdMsg, setPwdMsg]         = useState('');
  const [pwdError, setPwdError]     = useState('');

  async function handleNameSave(e: FormEvent) {
    e.preventDefault();
    setNameMsg(''); setSavingName(true);
    try {
      const updated = await apiFetch<AuthUser>('/api/v1/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ name: name.trim() }),
      });
      if (user) {
        setUser({ ...user, name: updated.name });
      }
      setNameMsg('Nome atualizado com sucesso!');
    } catch (err: any) { 
      setNameMsg(err.message ?? 'Erro ao atualizar nome.'); 
    } finally { 
      setSavingName(false); 
    }
  }

  async function handlePasswordSave(e: FormEvent) {
    e.preventDefault();
    setPwdMsg(''); setPwdError('');
    if (newPwd.length < 8) { setPwdError('A senha deve ter mínimo 8 caracteres.'); return; }
    if (newPwd !== confirmPwd) { setPwdError('As senhas não coincidem.'); return; }
    setSavingPwd(true);
    try {
      await apiFetch('/api/v1/auth/password', {
        method: 'PATCH',
        body: JSON.stringify({ oldPassword: oldPwd, newPassword: newPwd }),
      });
      setPwdMsg('Senha atualizada com sucesso!');
      setOldPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (err: any) { 
      setPwdError(err.message ?? 'Erro ao alterar senha.'); 
    } finally { 
      setSavingPwd(false); 
    }
  }

  function handleLogout() {
    clearAuth();
    router.push('/login');
  }

  return (
    <AppLayout>
      <div style={{ padding: '2rem', maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Perfil</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          Configurações da sua conta
        </p>

        {/* Avatar / identity */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--color-primary)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 700, flexShrink: 0,
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{user?.name}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{user?.email}</div>
          </div>
        </div>

        {/* Name form */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Dados pessoais</h2>
          <form onSubmit={handleNameSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="label" htmlFor="profile-name">Nome</label>
              <input id="profile-name" className="input-field"
                value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <label className="label">E-mail</label>
              <input className="input-field" value={user?.email ?? ''} disabled
                style={{ background: 'var(--color-surface-low)', color: 'var(--color-text-muted)', cursor: 'not-allowed' }} />
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                O e-mail não pode ser alterado.
              </p>
            </div>
            {nameMsg && (
              <div style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)', borderRadius: 'var(--radius-md)', padding: '0.625rem 0.875rem', fontSize: '0.875rem' }}>
                {nameMsg}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-primary" disabled={savingName}>
                {savingName ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </form>
        </div>

        {/* Password */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Alterar senha</h2>
          <form onSubmit={handlePasswordSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="label" htmlFor="old-pwd">Senha atual</label>
              <input id="old-pwd" className="input-field" type="password"
                value={oldPwd} onChange={e => setOldPwd(e.target.value)} required />
            </div>
            <div>
              <label className="label" htmlFor="new-pwd">Nova senha</label>
              <input id="new-pwd" className="input-field" type="password" minLength={8}
                value={newPwd} onChange={e => setNewPwd(e.target.value)} required />
            </div>
            <div>
              <label className="label" htmlFor="confirm-pwd">Confirmar nova senha</label>
              <input id="confirm-pwd" className="input-field" type="password"
                value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} required />
            </div>
            {pwdError && (
              <div style={{ background: 'var(--color-error-bg)', border: '1px solid #fecaca', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', padding: '0.625rem 0.875rem', fontSize: '0.875rem' }}>
                {pwdError}
              </div>
            )}
            {pwdMsg && (
              <div style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)', borderRadius: 'var(--radius-md)', padding: '0.625rem 0.875rem', fontSize: '0.875rem' }}>
                {pwdMsg}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-primary" disabled={savingPwd}>
                {savingPwd ? 'Alterando...' : 'Alterar senha'}
              </button>
            </div>
          </form>
        </div>

        {/* Danger zone */}
        <div className="card" style={{ padding: '1.5rem', borderColor: '#fecaca' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-error)', marginBottom: '0.75rem' }}>Zona de risco</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
            Sair da sua conta em todos os dispositivos.
          </p>
          <button className="btn-danger" onClick={handleLogout}>↩ Sair da conta</button>
        </div>
      </div>
    </AppLayout>
  );
}
