'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { apiFetch, getUser } from '@/lib/auth';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  dueDate?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const user = getUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getUser()) {
      router.push('/login');
      return;
    }
    loadTasks();
  }, [router]);

  async function loadTasks() {
    try {
      setLoading(false);
      const data = await apiFetch<Task[]>('/api/v1/tasks');
      setTasks(data || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setTasks([]);
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
    } catch (err) {
      console.error('Failed to create task:', err);
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
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  }


  const completedCount = tasks.filter((t) => t.status === 'DONE').length;
  const pendingCount = tasks.filter((t) => t.status !== 'DONE').length;
  const tasksByPriority = {
    HIGH: tasks.filter((t) => t.priority === 'HIGH').length,
    MEDIUM: tasks.filter((t) => t.priority === 'MEDIUM').length,
    LOW: tasks.filter((t) => t.priority === 'LOW').length,
  };

  return (
    <AppLayout>
      <main className="ml-64 flex-1 min-h-screen p-10 bg-surface">
        <div className="max-w-5xl mx-auto">
          {/* Header & Dramatic Typography */}
          <header className="mb-12">
            <h1 className="text-5xl font-extrabold tracking-tight text-on-surface mb-2">
              My Tasks
            </h1>
            <p className="text-on-surface-variant font-medium">
              You have {pendingCount} tasks pending for today.
            </p>
          </header>

          {/* Input Section: Architectural Input */}
          <section className="mb-16">
            <div className="relative group">
              <div className="absolute -top-1 left-0 w-full h-1 bg-primary-fixed">
                <div className="w-1/3 h-full bg-primary"></div>
              </div>
              <div className="flex items-center gap-4 bg-surface-container-low p-6 rounded-b-xl shadow-sm transition-all focus-within:shadow-md">
                <div className="flex-1 flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary">add_task</span>
                  <input
                    className="w-full bg-transparent border-none focus:ring-0 text-lg font-medium placeholder:text-outline p-0"
                    placeholder="Adicionar nova tarefa..."
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                  />
                </div>
                <button
                  onClick={handleAddTask}
                  disabled={loading}
                  className="bg-primary text-white w-12 h-12 rounded-xl flex items-center justify-center hover:bg-primary-container transition-colors active:scale-95"
                  type="button"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>
          </section>

          {/* Task List Area */}
          <section className="space-y-4">
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
                  className="flex items-center justify-between p-5 bg-surface-container-lowest rounded-lg hover:bg-surface-container-low hover:rounded-xl transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-6">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={task.status === 'DONE'}
                        onChange={() => toggleTask(task.id, task.status)}
                        className="w-6 h-6 rounded-md border-outline-variant text-primary focus:ring-primary/20 cursor-pointer"
                      />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-semibold ${
                          task.status === 'DONE'
                            ? 'text-on-surface-variant line-through'
                            : 'text-on-surface'
                        }`}
                      >
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-on-surface-variant">
                          {task.description}
                        </p>
                      )}
                      {task.dueDate && (
                        <p className="text-sm text-on-surface-variant">
                          {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {task.priority && (
                      <span
                        className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          task.priority === 'HIGH'
                            ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                            : task.priority === 'MEDIUM'
                              ? 'bg-secondary-fixed text-on-secondary-fixed'
                              : 'bg-primary-fixed text-on-primary-fixed'
                        }`}
                      >
                        {task.priority === 'HIGH'
                          ? 'High Priority'
                          : task.priority === 'MEDIUM'
                            ? 'Medium'
                            : 'Low'}
                      </span>
                    )}
                    <span className="material-symbols-outlined text-outline opacity-0 group-hover:opacity-100 transition-opacity">
                      more_vert
                    </span>
                  </div>
                </div>
              ))
            )}
          </section>

          {/* Bento Grid for Stats/Metadata */}
          {tasks.length > 0 && (
            <section className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-2 bg-primary p-8 rounded-3xl text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h4 className="text-2xl font-bold mb-4">Project Velocity</h4>
                  <p className="text-primary-fixed mb-8 max-w-xs">
                    You're completing tasks 15% faster than last week. Keep the momentum!
                  </p>
                  <div className="flex items-end gap-2 h-20">
                    <div className="w-3 bg-white/20 rounded-t-full h-1/2"></div>
                    <div className="w-3 bg-white/40 rounded-t-full h-3/4"></div>
                    <div className="w-3 bg-white/20 rounded-t-full h-1/3"></div>
                    <div className="w-3 bg-white rounded-t-full h-full"></div>
                    <div className="w-3 bg-white/60 rounded-t-full h-2/3"></div>
                  </div>
                </div>
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary-container rounded-full opacity-50 blur-3xl"></div>
              </div>
              <div className="bg-surface-container-high p-8 rounded-3xl flex flex-col justify-between">
                <span className="material-symbols-outlined text-tertiary text-4xl">trending_up</span>
                <div>
                  <p className="text-4xl font-black text-on-surface">{completedCount}</p>
                  <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-tighter">
                    Tasks Closed this month
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Contextual FAB (Only for main screens) */}
      <button
        onClick={() => {
          const input = document.querySelector(
            'input[placeholder="Adicionar nova tarefa..."]',
          ) as HTMLInputElement;
          if (input) input.focus();
        }}
        className="fixed bottom-10 right-10 bg-primary text-white p-5 rounded-full shadow-[0px_20px_40px_rgba(0,63,135,0.15)] hover:bg-primary-container transition-all hover:scale-110 active:scale-90 z-50"
        type="button"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </AppLayout>
  );
}
