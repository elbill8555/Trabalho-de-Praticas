'use client';

import { useState, useEffect, useCallback } from 'react';
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

const PRIORITY_LABEL: Record<string, string> = {
  LOW: 'Baixa', MEDIUM: 'Média', HIGH: 'Alta', URGENT: 'Urgente',
};

/* Colors matching Stitch prototype badge backgrounds */
const PRIORITY_STYLE: Record<string, { bg: string; color: string }> = {
  HIGH:   { bg: '#ffdbcc', color: '#351000' },  /* tertiary-fixed */
  URGENT: { bg: '#ffdbcc', color: '#351000' },
  MEDIUM: { bg: '#d7e2ff', color: '#041b3c' },  /* secondary-fixed */
  LOW:    { bg: '#edeeef', color: '#424752' },  /* surface-variant */
};

export default function DashboardPage() {
  const router  = useRouter();
  const user    = getUser();
  const [tasks,     setTasks]     = useState<Task[]>([]);
  const [projects,  setProjects]  = useState<Project[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [newTitle,  setNewTitle]  = useState('');
  const [checked,   setChecked]   = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    try {
      const [t, p] = await Promise.all([
        apiFetch<Task[]>('/api/v1/tasks'),
        apiFetch<Project[]>('/api/v1/projects'),
      ]);
      setTasks(t);
      setProjects(p);
      const init: Record<string, boolean> = {};
      t.forEach(task => { if (task.status === 'DONE') init[task.id] = true; });
      setChecked(init);
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
    window.addEventListener('refresh-data', load);
    return () => window.removeEventListener('refresh-data', load);
  }, [load]);

  const pending = tasks.filter(t => t.status === 'PENDING').length;
  const done    = tasks.filter(t => t.status === 'DONE').length;
  const total   = tasks.length;
  const pct     = total ? Math.round((done / total) * 100) : 0;

  /* Quick-add handler (visual only — calls API) */
  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const t = await apiFetch<Task>('/api/v1/tasks', {
        method: 'POST',
        body: JSON.stringify({ title: newTitle.trim(), status: 'PENDING', priority: 'MEDIUM' }),
      });
      setTasks(prev => [t, ...prev]);
      setNewTitle('');
    } catch { /* silently fail — user can go to /tasks for full form */ }
  }

  /* Toggle check (visual feedback only) */
  function toggleCheck(id: string) {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  }

  if (loading) return (
    <AppLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <span style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.9375rem' }}>Carregando...</span>
      </div>
    </AppLayout>
  );

  const displayTasks = tasks.slice(0, 6);
  const tasksClosedMonth = done;

  return (
    <AppLayout>
      {/* ── Stitch Dashboard Layout ─────────────────────────────────
          ml-64 p-10, max-w-5xl
          ─────────────────────────────────────────────────────────── */}
      <div style={{ padding: '2.5rem', maxWidth: '64rem', margin: '0 auto' }}>

        {/* ── Header — Dramatic Typography (text-5xl, font-extrabold) ── */}
        <header style={{ marginBottom: '3rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '3rem', fontWeight: 800,
            letterSpacing: '-0.03em', color: '#191c1d',
            marginBottom: '0.5rem',
          }}>
            Minhas Tarefas
          </h1>
          <p style={{ color: '#424752', fontWeight: 500 }}>
            {pending > 0
              ? `Você tem ${pending} tarefa${pending !== 1 ? 's' : ''} pendente${pending !== 1 ? 's' : ''} para hoje.`
              : 'Tudo em dia! Ótimo trabalho.'}
          </p>
        </header>

        {/* ── Architectural Input Section ─────────────────────────── */}
        <section style={{ marginBottom: '4rem' }}>
          <form onSubmit={handleAddTask}>
            <div style={{ position: 'relative' }}>
              {/* Progress bar top — Stitch "Signature Component" */}
              <div style={{ position: 'absolute', top: -4, left: 0, right: 0, height: 4, background: '#d7e2ff', borderRadius: '9999px 9999px 0 0' }}>
                <div style={{
                  height: '100%', background: '#003f87', borderRadius: 'inherit',
                  width: `${pct}%`, transition: 'width 0.6s ease',
                }} />
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                background: '#f3f4f5',
                padding: '1.5rem',
                borderRadius: '0 0 0.75rem 0.75rem',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                transition: 'box-shadow 0.15s',
              }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className="material-symbols-outlined" style={{ color: '#003f87', fontSize: '24px' }}>
                    add_task
                  </span>
                  <input
                    className="input-field-bare"
                    placeholder="Adicionar nova tarefa..."
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    style={{ background: 'transparent', borderBottom: 'none', padding: '0', fontSize: '1.0625rem', fontWeight: 500 }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    background: '#003f87', color: '#ffffff',
                    width: 48, height: 48, borderRadius: '0.75rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, border: 'none', cursor: 'pointer',
                    transition: 'background 0.15s, transform 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#0056b3'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = '#003f87'}
                  onMouseDown={e  => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.95)'}
                  onMouseUp={e    => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>add</span>
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* ── Task List ──────────────────────────────────────────── */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '5rem' }}>
          {tasks.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '3rem',
              color: '#727784', fontSize: '0.9375rem',
            }}>
              Nenhuma tarefa ainda. Adicione uma acima!
            </div>
          ) : (
            displayTasks.map(task => {
              const taskDone    = checked[task.id] ?? false;
              const pStyle  = PRIORITY_STYLE[task.priority] ?? PRIORITY_STYLE.LOW;
              const pLabel  = PRIORITY_LABEL[task.priority] ?? task.priority;
              const dateStr = task.dueDate
                ? new Date(task.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
                : null;

              return (
                <div
                  key={task.id}
                  style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.25rem',
                    background: taskDone ? 'rgba(255,255,255,0.5)' : '#ffffff',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    transition: 'background 0.15s, border-radius 0.15s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.background = '#f3f4f5';
                    (e.currentTarget as HTMLDivElement).style.borderRadius = '0.75rem';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.background = taskDone ? 'rgba(255,255,255,0.5)' : '#ffffff';
                    (e.currentTarget as HTMLDivElement).style.borderRadius = '0.5rem';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={taskDone}
                      onChange={() => toggleCheck(task.id)}
                      onClick={e => e.stopPropagation()}
                      style={{ width: 24, height: 24, borderRadius: '0.375rem', cursor: 'pointer', accentColor: '#003f87' }}
                    />
                    <div>
                      <h3 style={{
                        fontSize: '1.0625rem', fontWeight: 600,
                        color: taskDone ? '#727784' : '#191c1d',
                        textDecoration: taskDone ? 'line-through' : 'none',
                        fontFamily: 'var(--font-heading)',
                      }}>
                        {task.title}
                      </h3>
                      <p style={{ fontSize: '0.8125rem', color: '#727784', marginTop: '0.125rem' }}>
                        {dateStr ? `${dateStr} • ` : ''}{task.project?.name ?? task.status}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{
                      padding: '0.2rem 0.875rem',
                      borderRadius: '9999px',
                      background: taskDone ? '#edeeef' : pStyle.bg,
                      color: taskDone ? '#424752' : pStyle.color,
                      fontSize: '0.6875rem', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                      whiteSpace: 'nowrap',
                    }}>
                    {taskDone ? 'Concluída' : pLabel}
                    </span>
                    <span className="material-symbols-outlined" style={{ color: '#727784', fontSize: '22px', opacity: 0.6 }}>
                      more_vert
                    </span>
                  </div>
                </div>
              );
            })
          )}
          {tasks.length > 6 && (
            <Link href="/tasks" style={{
              textAlign: 'center', padding: '0.75rem',
              color: '#003f87', fontWeight: 600, fontSize: '0.875rem',
              borderRadius: '0.75rem', background: '#f3f4f5',
              display: 'block', textDecoration: 'none',
            }}>
              Ver todas as {tasks.length} tarefas →
            </Link>
          )}
        </section>

        {/* ── Bento Grid — Project Velocity + Stats ────────────────── */}
        <section style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          {/* Wide card — Project Velocity */}
          <div style={{
            background: '#003f87',
            padding: '2rem',
            borderRadius: '1.5rem',
            color: '#ffffff',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h4 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.5rem', fontWeight: 700,
                marginBottom: '1rem', color: '#fff',
              }}>
                Velocidade do Projeto
              </h4>
              <p style={{ color: '#d7e2ff', marginBottom: '2rem', maxWidth: '18rem', lineHeight: 1.5 }}>
                {pct > 0
                  ? `Você completou ${pct}% de suas tarefas. Mantenha o ritmo!`
                  : 'Adicione tarefas e comece a ganhar ritmo!'}
              </p>
              {/* Mini bar chart */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: 80 }}>
                {[0.5, 0.75, 0.33, 1, 0.66].map((h, i) => (
                  <div key={i} style={{
                    width: 12, borderRadius: '9999px 9999px 0 0',
                    background: i === 3 ? 'rgba(255,255,255,1)' : `rgba(255,255,255,${0.2 + h * 0.4})`,
                    height: `${Math.round(h * 100)}%`,
                  }} />
                ))}
              </div>
            </div>
            {/* Glow blob */}
            <div style={{
              position: 'absolute', right: -40, bottom: -40,
              width: 192, height: 192, borderRadius: '9999px',
              background: '#0056b3', opacity: 0.5, filter: 'blur(48px)',
            }} />
          </div>

          {/* Narrow card — Tasks closed */}
          <div style={{
            background: '#e7e8e9',
            padding: '2rem', borderRadius: '1.5rem',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <span className="material-symbols-outlined" style={{ color: '#722b00', fontSize: '40px' }}>
              trending_up
            </span>
            <div>
              <p style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '2.5rem', fontWeight: 900,
                color: '#191c1d', lineHeight: 1,
              }}>
                {tasksClosedMonth}
              </p>
              <p style={{
                fontSize: '0.75rem', fontWeight: 700,
                color: '#424752', textTransform: 'uppercase',
                letterSpacing: '-0.01em', marginTop: '0.25rem',
              }}>
                Tarefas fechadas neste mês
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* FAB removido: O botão de Nova Tarefa está na top nav */}
    </AppLayout>
  );
}
