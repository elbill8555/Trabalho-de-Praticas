'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import TaskModal, { Task } from '@/components/TaskModal';
import { apiFetch } from '@/lib/auth';

interface Project {
  id: string; name: string; description?: string; color: string;
  tasks: Task[];
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendente', IN_PROGRESS: 'Em andamento', DONE: 'Concluída',
};
const PRIORITY_LABEL: Record<string, string> = {
  LOW: 'Baixa', MEDIUM: 'Média', HIGH: 'Alta', URGENT: 'Urgente',
};

export default function ProjectDetailPage() {
  const router     = useRouter();
  const { id }     = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]    = useState<Task | null>(null);
  const [deleteId, setDeleteId]  = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<Project>(`/api/v1/projects/${id}`);
      setProject(data);
    } catch { router.push('/projects'); }
    finally { setLoading(false); }
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  function handleSaved(saved: Task) {
    setProject(prev => {
      if (!prev) return prev;
      const idx = prev.tasks.findIndex(t => t.id === saved.id);
      if (idx >= 0) {
        const nt = [...prev.tasks]; nt[idx] = saved;
        return { ...prev, tasks: nt };
      }
      return { ...prev, tasks: [saved, ...prev.tasks] };
    });
  }

  async function handleDelete(taskId: string) {
    await apiFetch(`/api/v1/tasks/${taskId}`, { method: 'DELETE' });
    setProject(prev => prev ? { ...prev, tasks: prev.tasks.filter(t => t.id !== taskId) } : prev);
    setDeleteId(null);
  }

  if (loading) return (
    <AppLayout>
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Carregando...</div>
    </AppLayout>
  );
  if (!project) return null;

  const done  = project.tasks.filter(t => t.status === 'DONE').length;
  const total = project.tasks.length;
  const pct   = total ? Math.round((done / total) * 100) : 0;

  return (
    <AppLayout>
      <div style={{ padding: '2rem', maxWidth: 960, margin: '0 auto' }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          <Link href="/projects" style={{ color: 'var(--color-primary)' }}>Projetos</Link> / {project.name}
        </div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <span style={{ width: 14, height: 14, borderRadius: '50%', background: project.color, flexShrink: 0 }} />
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{project.name}</h1>
              {project.description && <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.125rem' }}>{project.description}</p>}
            </div>
          </div>
          <button className="btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
            + Nova tarefa
          </button>
        </div>

        {/* Progress */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Progresso do projeto</span>
            <span style={{ fontWeight: 700, color: project.color }}>{pct}%</span>
          </div>
          <div style={{ height: 8, borderRadius: 9999, background: 'var(--color-surface-high)' }}>
            <div style={{ height: '100%', borderRadius: 9999, background: project.color, width: `${pct}%`, transition: 'width 0.5s' }} />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
            {done} de {total} tarefa{total !== 1 ? 's' : ''} concluída{done !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Tasks */}
        {project.tasks.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Nenhuma tarefa neste projeto ainda.</p>
            <button className="btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>Criar tarefa</button>
          </div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-surface-low)', borderBottom: '1px solid var(--color-border)' }}>
                  {['Tarefa', 'Status', 'Prioridade', 'Prazo', ''].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {project.tasks.map((t, i) => (
                  <tr key={t.id} style={{ borderBottom: i < project.tasks.length - 1 ? '1px solid var(--color-border)' : 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-low)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}>
                    <td style={{ padding: '0.875rem 1rem', maxWidth: 280 }}>
                      <div style={{ fontWeight: 500, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span className={`badge badge-${t.status.toLowerCase()}`} style={{ textTransform: 'none', letterSpacing: 0, fontSize: '0.75rem' }}>
                        {STATUS_LABEL[t.status]}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span className={`badge badge-${t.priority.toLowerCase()}`}>{PRIORITY_LABEL[t.priority]}</span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                        <button className="btn-ghost" style={{ fontSize: '0.8125rem', padding: '0.275rem 0.625rem' }}
                          onClick={() => { setEditing(t); setShowModal(true); }}>Editar</button>
                        <button className="btn-danger" style={{ fontSize: '0.8125rem', padding: '0.275rem 0.625rem' }}
                          onClick={() => setDeleteId(t.id)}>Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <TaskModal
          task={editing}
          projects={[project]}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSaved={handleSaved}
        />
      )}

      {deleteId && (
        <div className="overlay">
          <div className="modal" style={{ maxWidth: 380 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Excluir tarefa</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Tem certeza? Esta ação não pode ser desfeita.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn-ghost" onClick={() => setDeleteId(null)}>Cancelar</button>
              <button className="btn-danger" onClick={() => handleDelete(deleteId)}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
