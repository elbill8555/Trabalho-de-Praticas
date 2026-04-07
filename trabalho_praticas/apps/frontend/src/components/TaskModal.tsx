'use client';

import { useState, useEffect, FormEvent } from 'react';
import { apiFetch } from '@/lib/auth';

export interface Task {
  id: string; title: string; description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  projectId?: string | null;
  project?: { id: string; name: string; color: string } | null;
}

interface Project { id: string; name: string; color: string; }

interface Props {
  task?: Task | null;
  projects: Project[];
  onClose: () => void;
  onSaved: (t: Task) => void;
}

export default function TaskModal({ task, projects, onClose, onSaved }: Props) {
  const isEdit = !!task;
  const [title, setTitle]       = useState(task?.title ?? '');
  const [desc, setDesc]         = useState(task?.description ?? '');
  const [status, setStatus]     = useState<Task['status']>(task?.status ?? 'PENDING');
  const [priority, setPriority] = useState<Task['priority']>(task?.priority ?? 'MEDIUM');
  const [dueDate, setDueDate]   = useState(task?.dueDate ? task.dueDate.slice(0, 10) : '');
  const [projectId, setProjectId] = useState<string>(task?.projectId ?? '');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  // trap focus
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    const body = {
      title: title.trim(), description: desc.trim() || undefined,
      status, priority,
      dueDate: dueDate || undefined,
      projectId: projectId || null,
    };
    try {
      const saved = isEdit
        ? await apiFetch<Task>(`/api/v1/tasks/${task!.id}`, { method: 'PATCH', body: JSON.stringify(body) })
        : await apiFetch<Task>('/api/v1/tasks', { method: 'POST', body: JSON.stringify(body) });
      onSaved(saved);
      onClose();
    } catch (err: any) {
      setError(err.message ?? 'Erro ao salvar tarefa.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{isEdit ? 'Editar tarefa' : 'Nova tarefa'}</h2>
          <button className="btn-ghost" onClick={onClose} style={{ padding: '0.25rem 0.5rem', fontSize: '1.25rem' }}>×</button>
        </div>

        {error && (
          <div style={{ background: 'var(--color-error-bg)', border: '1px solid #fecaca', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', padding: '0.75rem', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="label" htmlFor="task-title">Título *</label>
            <input id="task-title" className="input-field" required autoFocus
              placeholder="Ex: Revisar proposta do cliente"
              value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          <div>
            <label className="label" htmlFor="task-desc">Descrição</label>
            <textarea id="task-desc" className="input-field" rows={3}
              placeholder="Detalhes opcionais..."
              style={{ resize: 'vertical' }}
              value={desc} onChange={e => setDesc(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="label" htmlFor="task-status">Status</label>
              <select id="task-status" className="input-field"
                value={status} onChange={e => setStatus(e.target.value as Task['status'])}>
                <option value="PENDING">Pendente</option>
                <option value="IN_PROGRESS">Em andamento</option>
                <option value="DONE">Concluída</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="task-priority">Prioridade</label>
              <select id="task-priority" className="input-field"
                value={priority} onChange={e => setPriority(e.target.value as Task['priority'])}>
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Média</option>
                <option value="HIGH">Alta</option>
                <option value="URGENT">Urgente</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="label" htmlFor="task-due">Prazo</label>
              <input id="task-due" className="input-field" type="date"
                value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="task-project">Projeto</label>
              <select id="task-project" className="input-field"
                value={projectId} onChange={e => setProjectId(e.target.value)}>
                <option value="">Sem projeto</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%' }} className="animate-spin" />
              ) : isEdit ? 'Salvar alterações' : 'Criar tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
