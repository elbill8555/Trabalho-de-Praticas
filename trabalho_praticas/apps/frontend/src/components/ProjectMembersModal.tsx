'use client';

import { useState, useEffect } from 'react';
import {
  addProjectMember,
  getProjectMembers,
  updateMemberRole,
  removeProjectMember,
  ProjectMember,
} from '@/lib/project-members';

interface ProjectMembersModalProps {
  projectId: string;
  projectName: string;
  onClose: () => void;
}

export default function ProjectMembersModal({
  projectId,
  projectName,
  onClose,
}: ProjectMembersModalProps) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'>('MEMBER');
  const [adding, setAdding] = useState(false);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);

  // Carregar membros
  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoading(true);
        const data = await getProjectMembers(projectId);
        setMembers(data);
        setError(null);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [projectId]);

  // Adicionar novo membro
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      setError('Por favor, digite um email válido');
      return;
    }

    try {
      setAdding(true);
      setError(null);
      const newMember = await addProjectMember(
        projectId,
        { email: newEmail, role: newRole }
      );
      setMembers((prev) => [...prev, newMember]);
      setNewEmail('');
      setNewRole('MEMBER');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAdding(false);
    }
  };

  // Atualizar papel do membro
  const handleUpdateRole = async (memberId: string, currentUserId: string, newRoleValue: string) => {
    try {
      setUpdatingRoleId(memberId);
      setError(null);
      const updatedMember = await updateMemberRole(
        projectId,
        currentUserId,
        { role: newRoleValue as 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER' }
      );
      if (updatedMember && updatedMember.user && updatedMember.user.id) {
        setMembers((prev) => prev.map((m) => (m.user.id === currentUserId ? updatedMember : m)));
      } else {
        throw new Error('Resposta inválida do servidor: faltam dados do usuário');
      }
    } catch (err) {
      console.error('Erro ao atualizar role:', err);
      setError(`Erro ao atualizar papel: ${(err as Error).message}`);
    } finally {
      setUpdatingRoleId(null);
    }
  };

  // Remover membro
  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Tem certeza que deseja remover este membro?')) return;

    try {
      setError(null);
      await removeProjectMember(projectId, userId);
      setMembers((prev) => prev.filter((m) => m.user.id !== userId));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="overlay">
      <div className="modal" style={{ maxWidth: 500 }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Membros de {projectName}</h2>

        {error && (
          <div style={{ background: 'var(--color-error-bg)', border: '1px solid var(--color-error)', color: 'var(--color-error)', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {/* Formulário para adicionar novo membro */}
        <form onSubmit={handleAddMember} style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.95rem' }}>Adicionar novo membro</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              type="email"
              placeholder="Email do novo membro"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="input-field"
              disabled={adding}
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as any)}
              className="input-field"
              disabled={adding}
            >
              <option value="VIEWER">Visualizador</option>
              <option value="MEMBER">Membro</option>
              <option value="ADMIN">Admin</option>
              <option value="OWNER">Proprietário</option>
            </select>
            <button
              type="submit"
              disabled={adding || !newEmail.trim()}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              {adding ? 'Adicionando...' : 'Adicionar Membro'}
            </button>
          </div>
        </form>

        {/* Lista de membros */}
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.95rem' }}>Membros atuais ({members.length})</h3>
          {loading ? (
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '1rem' }}>Carregando membros...</p>
          ) : members.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '1rem' }}>Nenhum membro adicionado</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {members.map((member) => (
                <div key={member.id} style={{ border: '1px solid var(--color-border)', borderRadius: '0.5rem', padding: '0.75rem', background: 'var(--color-surface-low)' }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{member.user.name}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>{member.user.email}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <select
                      value={member.role}
                      onChange={(e) =>
                        handleUpdateRole(member.id, member.user.id, e.target.value)
                      }
                      disabled={updatingRoleId === member.id}
                      className="input-field"
                      style={{ flex: 1, fontSize: '0.8125rem', opacity: updatingRoleId === member.id ? 0.6 : 1 }}
                    >
                      <option value="VIEWER">Visualizador</option>
                      <option value="MEMBER">Membro</option>
                      <option value="ADMIN">Admin</option>
                      <option value="OWNER">Proprietário</option>
                    </select>
                    <button
                      onClick={() => handleRemoveMember(member.user.id)}
                      disabled={updatingRoleId === member.id}
                      className="btn-danger"
                      style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem', flexShrink: 0, opacity: updatingRoleId === member.id ? 0.6 : 1 }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button
            onClick={onClose}
            className="btn-ghost"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
