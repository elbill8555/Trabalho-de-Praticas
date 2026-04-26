'use client';

import { useState, useEffect } from 'react';
import type { Task } from '@/components/TaskModal';
import { apiFetch } from '@/lib/auth';
import { getProjectMembers, ProjectMember } from '@/lib/project-members';

interface TaskAssigneeModalProps {
  task: Task;
  projectId: string;
  onClose: () => void;
  onAssign: (task: Task) => void;
}

export default function TaskAssigneeModal({
  task,
  projectId,
  onClose,
  onAssign,
}: TaskAssigneeModalProps) {
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);

  // Carregar membros do projeto
  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoading(true);
        const data = await getProjectMembers(projectId);
        setProjectMembers(data);
        setError(null);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [projectId]);

  // Atribuir tarefa a um usuário
  const handleAssign = async (userId: string) => {
    try {
      setAssigning(true);
      setError(null);

      const updatedTask = await apiFetch<Task>(`/api/v1/tasks/${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          assignedToId: userId,
        }),
      });
      onAssign(updatedTask);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAssigning(false);
    }
  };

  // Remover atribuição
  const handleRemoveAssignee = async () => {
    try {
      setAssigning(true);
      setError(null);

      const updatedTask = await apiFetch<Task>(`/api/v1/tasks/${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          assignedToId: null,
        }),
      });
      onAssign(updatedTask);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="overlay">
      <div className="modal" style={{ maxWidth: 500 }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{task.title}</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>Atribuir responsável</p>

        {error && (
          <div style={{ background: '#fee', border: '1px solid #fcc', color: '#c33', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {task.assignedTo && (
          <div style={{ background: 'var(--color-surface-low)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.25rem' }}>Atualmente atribuído a:</p>
            <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>{task.assignedTo.name}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>{task.assignedTo.email}</p>
            <button
              onClick={handleRemoveAssignee}
              disabled={assigning}
              style={{ fontSize: '0.8125rem', color: 'var(--color-danger)', cursor: 'pointer', textDecoration: 'underline', background: 'none', border: 'none', padding: 0, opacity: assigning ? 0.5 : 1 }}
            >
              Remover atribuição
            </button>
          </div>
        )}

        <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.95rem' }}>Selecionar novo responsável</h3>

        {loading ? (
          <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '1rem' }}>Carregando membros...</p>
        ) : projectMembers.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '1rem' }}>Nenhum membro disponível neste projeto</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            {projectMembers.map((member) => (
              <button
                key={member.user.id}
                onClick={() => handleAssign(member.user.id)}
                disabled={assigning || task.assignedTo?.id === member.user.id}
                style={{
                  textAlign: 'left',
                  padding: '0.75rem 1rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: '0.5rem',
                  background: 'var(--color-surface-low)',
                  cursor: assigning || task.assignedTo?.id === member.user.id ? 'not-allowed' : 'pointer',
                  opacity: assigning || task.assignedTo?.id === member.user.id ? 0.5 : 1,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!assigning && task.assignedTo?.id !== member.user.id) {
                    (e.target as HTMLElement).style.background = 'var(--color-surface-high)';
                  }
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.background = 'var(--color-surface-low)';
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{member.user.name}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{member.user.email}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.375rem' }}>
                  {member.role === 'VIEWER' && 'Visualizador'}
                  {member.role === 'MEMBER' && 'Membro'}
                  {member.role === 'ADMIN' && 'Admin'}
                  {member.role === 'OWNER' && 'Proprietário'}
                </div>
              </button>
            ))}
          </div>
        )}

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
