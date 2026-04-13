'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { apiFetch, getUser, getToken } from '@/lib/auth';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  dueDate?: string;
  projectId?: string;
  project?: { id: string; name: string; color: string } | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const user = getUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    loadTasks();
  }, [router]);

  async function loadTasks() {
    try {
      setLoading(true);
      const data = await apiFetch<Task[]>('/api/v1/tasks');
      setTasks(data || []);
      setError('');
    } catch (err: any) {
      console.error('[DASHBOARD] Failed to load tasks:', err);
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTask() {
    if (!newTaskTitle.trim()) return;
    try {
      const newTask = await apiFetch<Task>('/api/v1/tasks', {
        method: 'POST',
        body: JSON.stringify({ title: newTaskTitle, status: 'PENDING', priority: 'MEDIUM' }),
      });
      setTasks([newTask, ...tasks]);
      setNewTaskTitle('');
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    }
  }

  async function toggleTask(taskId: string, currentStatus: string) {
    try {
      const newStatus = currentStatus === 'PENDING' ? 'DONE' : 'PENDING';
      const updated = await apiFetch<Task>(`/api/v1/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setTasks(tasks.map((t) => (t.id === taskId ? updated : t)));
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
    }
  }

  const completedCount = tasks.filter((t) => t.status === 'DONE').length;
  const pendingCount = tasks.filter((t) => t.status !== 'DONE').length;

  return (
    <AppLayout>
      <div className="flex-1 overflow-auto bg-surface">
        {/* Header with Title */}
        <header className="sticky top-0 z-10 bg-surface border-b border-outline-variant/10 px-8 py-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">
            Minhas Tarefas
          </h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">
            {pendingCount} {pendingCount === 1 ? 'tarefa' : 'tarefas'} pendente{pendingCount !== 1 ? 's' : ''}.
          </p>
        </header>

        {/* Main Content */}
        <div className="p-8 space-y-8">
          {error && (
            <div className="p-4 bg-error-container rounded-lg border border-error/30">
              <p className="text-error text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Input Section */}
          <section>
            <div className="relative group">
              <div className="absolute -top-1 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary to-primary-container rounded-t-lg"></div>
              <div className="flex items-center gap-4 bg-surface-container-low p-5 rounded-b-xl shadow-sm group-focus-within:shadow-md transition-all">
                <span className="material-symbols-outlined text-primary text-[24px]">
                  add_task
                </span>
                <input
                  className="flex-1 bg-transparent border-none focus:ring-0 text-base font-medium placeholder:text-outline p-0 outline-none"
                  placeholder="Adicionar nova tarefa..."
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                />
                <button
                  onClick={handleAddTask}
                  className="bg-primary text-on-primary w-12 h-12 rounded-full flex items-center justify-center hover:bg-primary-container transition-all active:scale-95 flex-shrink-0"
                  disabled={loading}
                  type="button"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>
          </section>

          {/* Task List */}
          <section className="space-y-3">
            {loading ? (
              <div className="text-center py-12 text-on-surface-variant">
                <p className="font-medium">Carregando tarefas...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant">
                <span className="material-symbols-outlined text-5xl opacity-30 block mb-4">
                  task_alt
                </span>
                <p className="font-medium">Nenhuma tarefa ainda. Crie uma para começar!</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-5 rounded-xl transition-all border group cursor-pointer ${
                    task.status === 'DONE'
                      ? 'bg-surface-container-lowest border-outline-variant/10 hover:bg-surface-container-low'
                      : 'bg-surface-container-lowest border-outline-variant/20 hover:bg-surface-container-low hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={task.status === 'DONE'}
                      onChange={() => toggleTask(task.id, task.status)}
                      className="w-6 h-6 rounded border-2 border-outline-variant text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-semibold text-base ${
                          task.status === 'DONE'
                            ? 'text-on-surface-variant line-through'
                            : 'text-on-surface'
                        }`}
                      >
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-on-surface-variant mt-1 line-clamp-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    {task.priority && (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap ${
                          task.priority === 'HIGH'
                            ? 'bg-error/20 text-error'
                            : task.priority === 'MEDIUM'
                              ? 'bg-secondary/20 text-secondary'
                              : 'bg-primary/20 text-primary'
                        }`}
                      >
                        {task.priority === 'HIGH'
                          ? 'Urgente'
                          : task.priority === 'MEDIUM'
                            ? 'Normal'
                            : 'Baixa'}
                      </span>
                    )}
                    <button
                      className="material-symbols-outlined text-outline opacity-0 group-hover:opacity-70 transition-opacity hover:text-on-surface-variant"
                      type="button"
                      tabIndex={-1}
                    >
                      more_vert
                    </button>
                  </div>
                </div>
              ))
            )}
          </section>

          {/* Stats Cards - Bento Grid Style */}
          {tasks.length > 0 && (
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {/* Project Velocity - Large Card */}
              <div className="md:col-span-2 bg-gradient-to-br from-primary to-primary-container text-on-primary p-8 rounded-3xl relative overflow-hidden shadow-lg">
                <div className="relative z-10">
                  <h4 className="text-2xl font-bold mb-2">Velocidade de Progresso</h4>
                  <p className="text-on-primary/80 font-medium mb-6 max-w-xs">
                    {completedCount} tarefas concluídas. Continue assim!
                  </p>
                  <div className="flex items-end gap-2 h-24">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-white/30 rounded-t-lg transition-all hover:bg-white/50"
                        style={{
                          height: `${20 + (i * 15)}%`,
                        }}
                        title={`Dia ${i + 1}`}
                      ></div>
                    ))}
                  </div>
                </div>
                <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-on-primary/10 rounded-full blur-3xl"></div>
              </div>

              {/* Tasks Closed */}
              <div className="bg-surface-container-high p-8 rounded-3xl flex flex-col justify-between border border-outline-variant/10 shadow-sm">
                <span className="material-symbols-outlined text-tertiary text-[32px]">
                  check_circle
                </span>
                <div>
                  <p className="text-4xl font-black text-on-surface">{completedCount}</p>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-2">
                    Concluídas
                  </p>
                </div>
              </div>

              {/* Pending Tasks */}
              <div className="bg-surface-container-high p-8 rounded-3xl flex flex-col justify-between border border-outline-variant/10 shadow-sm">
                <span className="material-symbols-outlined text-secondary text-[32px]">
                  assignment_late
                </span>
                <div>
                  <p className="text-4xl font-black text-on-surface">{pendingCount}</p>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-2">
                    Pendentes
                  </p>
                </div>
              </div>

              {/* Total Tasks */}
              <div className="bg-surface-container-high p-8 rounded-3xl flex flex-col justify-between border border-outline-variant/10 shadow-sm">
                <span className="material-symbols-outlined text-primary text-[32px]">
                  checklist
                </span>
                <div>
                  <p className="text-4xl font-black text-on-surface">{tasks.length}</p>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-2">
                    Total
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Floating Action Button */}
        <button
          onClick={() => {
            const input = document.querySelector('input[placeholder="Adicionar nova tarefa..."]') as HTMLInputElement;
            if (input) input.focus();
          }}
          className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-primary to-primary-container text-white rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all active:scale-95 hover:scale-110 z-30"
          type="button"
        >
          <span className="material-symbols-outlined text-2xl">add</span>
        </button>
      </div>
    </AppLayout>
  );
}
