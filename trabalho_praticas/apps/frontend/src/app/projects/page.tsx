'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import ProjectMembersModal from '@/components/ProjectMembersModal';
import { apiFetch } from '@/lib/auth';

interface Project {
  id: string; name: string; description?: string; color: string;
  _count?: { tasks: number };
  tasks?: { id: string; status: string }[];
}

const PROJECT_COLORS = [
  '#003f87','#1d4ed8','#7c3aed','#db2777','#dc2626',
  '#f59e0b','#059669','#0891b2','#374151','#9f1239',
];

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects]   = useState<Project[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState<Project | null>(null);
  const [deleteId, setDeleteId]   = useState<string | null>(null);
  const [memberModalProject, setMemberModalProject] = useState<Project | null>(null);
  const [token, setToken] = useState<string>('');

  // form state
  const [name, setName]         = useState('');
  const [desc, setDesc]         = useState('');
  const [color, setColor]       = useState(PROJECT_COLORS[0]);
  const [saving, setSaving]     = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<Project[]>('/api/v1/projects');
      setProjects(data);
      // Get token from localStorage
      const storedToken = localStorage.getItem('token') || '';
      setToken(storedToken);
    } catch { router.push('/login'); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => {
    load();
    window.addEventListener('refresh-data', load);
    return () => window.removeEventListener('refresh-data', load);
  }, [load]);

  function openCreate() {
    setEditing(null); setName(''); setDesc(''); setColor(PROJECT_COLORS[0]);
    setFormError(''); setShowForm(true);
  }
  function openEdit(p: Project) {
    setEditing(p); setName(p.name); setDesc(p.description ?? '');
    setColor(p.color); setFormError(''); setShowForm(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setFormError(''); setSaving(true);
    try {
      const body = { name: name.trim(), description: desc.trim() || undefined, color };
      const saved = editing
        ? await apiFetch<Project>(`/api/v1/projects/${editing.id}`, { method: 'PATCH', body: JSON.stringify(body) })
        : await apiFetch<Project>('/api/v1/projects', { method: 'POST', body: JSON.stringify(body) });
      setProjects(prev => {
        const idx = prev.findIndex(p => p.id === saved.id);
        if (idx >= 0) { const n = [...prev]; n[idx] = saved; return n; }
        return [saved, ...prev];
      });
      setShowForm(false);
    } catch (err: any) {
      setFormError(err.message ?? 'Erro ao salvar.');
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    await apiFetch(`/api/v1/projects/${id}`, { method: 'DELETE' });
    setProjects(prev => prev.filter(p => p.id !== id));
    setDeleteId(null);
  }

  return (
    <AppLayout>
      <div style={{ padding: '2rem', maxWidth: 960, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Projetos</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Organize suas tarefas por contexto e meta
            </p>
          </div>
          <button id="btn-new-project" className="btn-primary" onClick={openCreate}>+ Novo projeto</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>Carregando...</div>
        ) : projects.length === 0 ? (
          <div className="card" style={{ padding: '3.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>◉</div>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Nenhum projeto criado ainda.</p>
            <button className="btn-primary" onClick={openCreate}>Criar primeiro projeto</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {projects.map(p => {
              const totalT = p._count?.tasks ?? 0;
              const doneT  = (p.tasks ?? []).filter(t => t.status === 'DONE').length;
              const pct    = totalT ? Math.round((doneT / totalT) * 100) : 0;
              return (
                <div key={p.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Color bar */}
                  <div style={{ height: 4, borderRadius: 9999, background: p.color, marginBottom: '-0.25rem' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{p.name}</h3>
                      {p.description && <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{p.description}</p>}
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{doneT}/{totalT} tarefas</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: p.color }}>{pct}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 9999, background: 'var(--color-surface-high)' }}>
                      <div style={{ height: '100%', borderRadius: 9999, background: p.color, width: `${pct}%`, transition: 'width 0.4s' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <Link href={`/projects/${p.id}`} className="btn-ghost" style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}>
                      Ver tarefas
                    </Link>
                    <button className="btn-ghost" style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }} onClick={() => setMemberModalProject(p)}>
                      👥 Membros
                    </button>
                    <button className="btn-ghost" style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }} onClick={() => openEdit(p)}>
                      Editar
                    </button>
                    <button className="btn-danger" style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }} onClick={() => setDeleteId(p.id)}>
                      Excluir
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="overlay" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{editing ? 'Editar projeto' : 'Novo projeto'}</h2>
              <button className="btn-ghost" onClick={() => setShowForm(false)} style={{ padding: '0.25rem 0.5rem', fontSize: '1.25rem' }}>×</button>
            </div>
            {formError && (
              <div style={{ background: 'var(--color-error-bg)', border: '1px solid #fecaca', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', padding: '0.75rem', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {formError}
              </div>
            )}
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="label" htmlFor="proj-name">Nome *</label>
                <input id="proj-name" className="input-field" required autoFocus
                  placeholder="Ex: Aplicativo mobile" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="proj-desc">Descrição</label>
                <textarea id="proj-desc" className="input-field" rows={2}
                  placeholder="Descreva o contexto do projeto..."
                  style={{ resize: 'vertical' }}
                  value={desc} onChange={e => setDesc(e.target.value)} />
              </div>
              <div>
                <label className="label">Cor</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {PROJECT_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setColor(c)}
                      style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: c === color ? '3px solid #000' : '3px solid transparent', cursor: 'pointer', transition: 'transform 0.1s' }}
                      title={c} />
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? '...' : editing ? 'Salvar alterações' : 'Criar projeto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {deleteId && (
        <div className="overlay">
          <div className="modal" style={{ maxWidth: 380 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Excluir projeto</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Tem certeza? As tarefas vinculadas perderão o projeto, mas não serão apagadas.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn-ghost" onClick={() => setDeleteId(null)}>Cancelar</button>
              <button className="btn-danger" onClick={() => handleDelete(deleteId)}>Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* Members modal */}
      {memberModalProject && token && (
        <ProjectMembersModal
          projectId={memberModalProject.id}
          projectName={memberModalProject.name}
          token={token}
          onClose={() => setMemberModalProject(null)}
        />
      )}
    </AppLayout>
  );
}
