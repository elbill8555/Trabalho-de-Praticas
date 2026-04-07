'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { apiFetch, getUser } from '@/lib/auth';

interface Task {
  id: string; title: string; status: string;
  priority: string; dueDate?: string;
  project?: { id: string; name: string; color: string } | null;
}
interface Project {
  id: string; name: string; color: string; description?: string;
  _count?: { tasks: number };
  tasks?: { id: string; status: string }[];
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendente', IN_PROGRESS: 'Em andamento', DONE: 'Concluída',
};
const PRIORITY_LABEL: Record<string, string> = {
  LOW: 'Baixa', MEDIUM: 'Média', HIGH: 'Alta', URGENT: 'Urgente',
};

export default function DashboardPage() {
  const router  = useRouter();
  const user    = getUser();
  const [tasks, setTasks]       = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<Task[]>('/api/v1/tasks'),
      apiFetch<Project[]>('/api/v1/projects'),
    ]).then(([t, p]) => { setTasks(t); setProjects(p); })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const pending   = tasks.filter(t => t.status === 'PENDING').length;
  const inProg    = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const done      = tasks.filter(t => t.status === 'DONE').length;
  const total     = tasks.length;
  const pct       = total ? Math.round((done / total) * 100) : 0;

  const upcoming  = tasks
    .filter(t => t.dueDate && t.status !== 'DONE')
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  return (
    <AppLayout>
      <div style={{ padding: '2rem', maxWidth: 960, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)' }}>
            Olá, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
            Aqui está o resumo da sua semana.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
            Carregando...
          </div>
        ) : (
          <>
            {/* Stats cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { label: 'Total de tarefas',    value: total,   color: '#003f87', bg: '#d6e4ff' },
                { label: 'Pendentes',           value: pending, color: '#92400e', bg: '#fef3c7' },
                { label: 'Em andamento',        value: inProg,  color: '#1e40af', bg: '#dbeafe' },
                { label: 'Concluídas',          value: done,    color: '#065f46', bg: '#d1fae5' },
              ].map(s => (
                <div key={s.label} className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color, fontFamily: 'var(--font-heading)' }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>{s.label}</div>
                  <div style={{ marginTop: '0.75rem', height: 4, borderRadius: 9999, background: 'var(--color-surface-high)' }}>
                    <div style={{ height: '100%', borderRadius: 9999, background: s.color, width: total ? `${Math.round((s.value / total) * 100)}%` : '0%', transition: 'width 0.5s' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Completion progress */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Progresso geral</span>
                <span style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--color-primary)' }}>{pct}%</span>
              </div>
              <div style={{ height: 10, borderRadius: 9999, background: 'var(--color-surface-high)' }}>
                <div style={{ height: '100%', borderRadius: 9999, background: 'var(--color-primary)', width: `${pct}%`, transition: 'width 0.6s ease' }} />
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.625rem' }}>
                {done} de {total} tarefa{total !== 1 ? 's' : ''} concluída{done !== 1 ? 's' : ''}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Upcoming tasks */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Próximas tarefas</h2>
                  <Link href="/tasks" style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 600 }}>Ver todas →</Link>
                </div>
                {upcoming.length === 0 ? (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Nenhuma tarefa com prazo definido.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {upcoming.map(t => (
                      <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)' }}>
                        <span className={`badge badge-${t.priority.toLowerCase()}`}>{PRIORITY_LABEL[t.priority]}</span>
                        <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                          {new Date(t.dueDate!).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Projects */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Projetos ativos</h2>
                  <Link href="/projects" style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 600 }}>Ver todos →</Link>
                </div>
                {projects.length === 0 ? (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Nenhum projeto criado ainda.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {projects.slice(0, 4).map(p => {
                      const doneCount = (p.tasks ?? []).filter(t => t.status === 'DONE').length;
                      const totalP    = p._count?.tasks ?? 0;
                      const ppcT      = totalP ? Math.round((doneCount / totalP) * 100) : 0;
                      return (
                        <Link key={p.id} href={`/projects/${p.id}`} style={{ display: 'block' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', transition: 'background 0.15s' }}>
                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                            <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500 }}>{p.name}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{doneCount}/{totalP}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
