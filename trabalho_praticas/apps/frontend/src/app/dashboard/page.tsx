'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
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

interface Project {
  id: string;
  name: string;
  color: string;
  description?: string;
  _count?: { tasks: number };
  tasks?: { id: string; status: string }[];
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
  const highPriorityCount = tasks.filter((t) => t.priority === 'HIGH').length;

  return (
    <Layout>
      <header className="mb-12">
        <h1 className="text-5xl font-extrabold tracking-tight text-on-surface mb-2">My Tasks</h1>
        <p className="text-on-surface-variant font-medium">
          {pendingCount} {pendingCount === 1 ? 'task' : 'tasks'} pending today.
        </p>
      </header>

      {error && (
        <div className="mb-8 p-4 bg-error-container rounded-lg border border-error/30">
          <p className="text-error text-sm">{error}</p>
        </div>
      )}

      {/* Input Section */}
      <section className="mb-16">
        <div className="relative group">
          <div className="absolute -top-1 left-0 w-full h-1 bg-primary-fixed">
            <div className="w-1/3 h-full bg-primary"></div>
          </div>
          <div className="flex items-center gap-4 bg-surface-container-low p-6 rounded-b-xl shadow-sm transition-all focus-within:shadow-md">
            <div className="flex-1 flex items-center gap-4">
              <span className="material-symbols-outlined text-primary">add_task</span>
              <input
                className="w-full bg-transparent border-none focus:ring-0 text-lg font-medium placeholder:text-outline p-0 outline-none"
                placeholder="Add a new task..."
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
              />
            </div>
            <button
              onClick={handleAddTask}
              className="bg-primary text-white w-12 h-12 rounded-xl flex items-center justify-center hover:bg-primary-container transition-colors active:scale-95"
              disabled={loading}
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
        </div>
      </section>

      {/* Task List */}
      <section className="space-y-4 mb-20">
        {loading ? (
          <div className="text-center py-12 text-on-surface-variant">
            <p>Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant">
            <p>No tasks yet. Create one to get started!</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center justify-between p-5 rounded-lg transition-all group cursor-pointer ${
                task.status === 'DONE'
                  ? 'bg-surface-container-lowest/50 hover:bg-surface-container-low/50'
                  : 'bg-surface-container-lowest hover:bg-surface-container-low'
              }`}
            >
              <div className="flex items-center gap-6 flex-1">
                <input
                  type="checkbox"
                  checked={task.status === 'DONE'}
                  onChange={() => toggleTask(task.id, task.status)}
                  className="w-6 h-6 rounded-md border-outline-variant text-primary focus:ring-primary/20 cursor-pointer"
                />
                <div className="flex-1">
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
                    <p className="text-sm text-on-surface-variant mt-1">{task.description}</p>
                  )}
                  {task.dueDate && (
                    <p className="text-xs text-on-surface-variant mt-2">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
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
                    {task.priority}
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

      {/* Stats Cards */}
      {tasks.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 bg-primary p-8 rounded-3xl text-white relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-2xl font-bold mb-4">Productivity Overview</h4>
              <p className="text-primary-fixed mb-8 max-w-xs">
                {completedCount} tasks completed. Keep the momentum!
              </p>
              <div className="flex items-end gap-2 h-20">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-3 bg-white/40 rounded-t-full flex-1"
                    style={{
                      height: `${30 + Math.random() * 70}%`,
                    }}
                  ></div>
                ))}
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary-container rounded-full opacity-50 blur-3xl"></div>
          </div>

          <div className="bg-surface-container-high p-8 rounded-3xl flex flex-col justify-between">
            <span className="material-symbols-outlined text-tertiary text-4xl">trending_up</span>
            <div>
              <p className="text-4xl font-black text-on-surface">{completedCount}</p>
              <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-tighter">
                Tasks Completed
              </p>
            </div>
          </div>

          <div className="bg-surface-container-high p-8 rounded-3xl flex flex-col justify-between">
            <span className="material-symbols-outlined text-secondary text-4xl">assignment</span>
            <div>
              <p className="text-4xl font-black text-on-surface">{highPriorityCount}</p>
              <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-tighter">
                High Priority
              </p>
            </div>
          </div>

          <div className="bg-surface-container-high p-8 rounded-3xl flex flex-col justify-between">
            <span className="material-symbols-outlined text-primary text-4xl">checklist</span>
            <div>
              <p className="text-4xl font-black text-on-surface">{tasks.length}</p>
              <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-tighter">
                Total Tasks
              </p>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}
