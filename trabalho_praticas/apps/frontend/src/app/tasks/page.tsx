'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import TaskModal, { Task } from '@/components/TaskModal';
import TaskAssigneeModal from '@/components/TaskAssigneeModal';
import { apiFetch } from '@/lib/auth';

interface Project { id: string; name: string; color: string; }

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendente', IN_PROGRESS: 'Em andamento', DONE: 'Concluída',
};
const PRIORITY_LABEL: Record<string, string> = {
  LOW: 'Baixa', MEDIUM: 'Média', HIGH: 'Alta', URGENT: 'Urgente',
};

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks]       = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState<Task | null>(null);
  const [filterStatus, setFilterStatus]     = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [search, setSearch]     = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [assigneeModalTask, setAssigneeModalTask] = useState<Task | null>(null);

  const load = useCallback(async () => {
    try {
      const [t, p] = await Promise.all([
        apiFetch<Task[]>('/api/v1/tasks'),
        apiFetch<Project[]>('/api/v1/projects'),
      ]);
      setTasks(t);
      setProjects(p);
    } catch { router.push('/login'); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => {
    load();
    window.addEventListener('refresh-data', load);
    return () => window.removeEventListener('refresh-data', load);
  }, [load]);

  async function handleDelete(id: string) {
    await apiFetch(`/api/v1/tasks/${id}`, { method: 'DELETE' });
    setTasks(prev => prev.filter(t => t.id !== id));
    setDeleteId(null);
  }

  function handleSaved(saved: Task) {
    setTasks(prev => {
      const idx = prev.findIndex(t => t.id === saved.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next; }
      return [saved, ...prev];
    });
  }

  function handleTaskAssigned(assignedTask: Task) {
    handleSaved(assignedTask);
    setAssigneeModalTask(null);
  }

  // Filters
  const visible = tasks.filter(t => {
    if (filterStatus   && t.status   !== filterStatus)   return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <AppLayout>
      <div style={{ padding: '2rem', maxWidth: 960, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Tarefas</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {tasks.length} {tasks.length === 1 ? 'tarefa' : 'tarefas'} no total
            </p>
          </div>
          <button id="btn-new-task" className="btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
            + Nova tarefa
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <input className="input-field" style={{ maxWidth: 220, flex: '1 1 160px' }}
            placeholder="🔍 Buscar tarefa..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <select className="input-field" style={{ maxWidth: 170, flex: '0 0 auto' }}
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Todos os status</option>
            <option value="PENDING">Pendente</option>
            <option value="IN_PROGRESS">Em andamento</option>
            <option value="DONE">Concluída</option>
          </select>
          <select className="input-field" style={{ maxWidth: 170, flex: '0 0 auto' }}
            value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="">Todas as prioridades</option>
            <option value="LOW">Baixa</option>
            <option value="MEDIUM">Média</option>
            <option value="HIGH">Alta</option>
            <option value="URGENT">Urgente</option>
          </select>
          {(filterStatus || filterPriority || search) && (
            <button className="btn-ghost" style={{ flexShrink: 0 }}
              onClick={() => { setFilterStatus(''); setFilterPriority(''); setSearch(''); }}>
              Limpar filtros
            </button>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>Carregando...</div>
        ) : visible.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              {tasks.length === 0 ? 'Nenhuma tarefa ainda.' : 'Nenhuma tarefa encontrada com esses filtros.'}
            </p>
            {tasks.length === 0 && (
              <button className="btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
                Criar primeira tarefa
              </button>
            )}
          </div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-surface-low)', borderBottom: '1px solid var(--color-border)' }}>
                  {['Tarefa', 'Status', 'Prioridade', 'Prazo', 'Projeto', 'Responsável', ''].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((t, i) => (
                  <tr key={t.id} style={{ borderBottom: i < visible.length - 1 ? '1px solid var(--color-border)' : 'none', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-low)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}>
                    <td style={{ padding: '0.875rem 1rem', maxWidth: 300 }}>
                      <div style={{ fontWeight: 500, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                      {t.description && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</div>}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span className={`badge badge-${t.status.toLowerCase().replace('_', '_')}`}
                        style={{ textTransform: 'none', letterSpacing: 0, fontSize: '0.75rem' }}>
                        {STATUS_LABEL[t.status]}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span className={`badge badge-${t.priority.toLowerCase()}`}>
                        {PRIORITY_LABEL[t.priority]}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', minWidth: 220, whiteSpace: 'normal' }}>
                      {t.project ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.project.color, flexShrink: 0 }} />
                          {t.project.name}
                        </span>
                      ) : <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>—</span>}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem' }}>
                      {t.assignedTo ? (
                        <span>{t.assignedTo.name}</span>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                        {t.project && (
                          <button className="btn-ghost" style={{ padding: '0.275rem 0.625rem', fontSize: '0.8125rem' }}
                            onClick={() => setAssigneeModalTask(t)}>👤 Atribuir</button>
                        )}
                        <button className="btn-ghost" style={{ padding: '0.275rem 0.625rem', fontSize: '0.8125rem' }}
                          onClick={() => { setEditing(t); setShowModal(true); }}>Editar</button>
                        <button className="btn-danger" style={{ padding: '0.275rem 0.625rem', fontSize: '0.8125rem' }}
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

      {/* Modal criar/editar */}
      {showModal && (
        <TaskModal
          task={editing}
          projects={projects}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSaved={handleSaved}
        />
      )}

      {/* Confirm delete */}
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

      {/* Assignee modal */}
      {assigneeModalTask && (
        <TaskAssigneeModal
          task={assigneeModalTask}
          projectId={assigneeModalTask.project?.id || ''}
          onClose={() => setAssigneeModalTask(null)}
          onAssign={handleTaskAssigned}
        />
      )}
    </AppLayout>
  );
}
