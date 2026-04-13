'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getToken, getUser, clearAuth } from '@/lib/auth';

const NAV = [
  { href: '/dashboard', label: 'Minhas Tarefas', icon: 'task_alt' },
  { href: '/tasks', label: 'Inbox', icon: 'inbox' },
  { href: '/projects', label: 'Projetos', icon: 'work' },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = getUser();

  useEffect(() => {
    if (!getToken()) router.replace('/login');
  }, [router]);

  function handleLogout() {
    clearAuth();
    router.push('/login');
  }

  if (!getToken()) return null;

  return (
    <div className="flex h-screen bg-surface">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 fixed left-0 top-0 h-screen bg-surface-container-lowest border-r border-outline-variant/10 flex flex-col overflow-y-auto z-40 shadow-sm">
        {/* Workspace Header */}
        <div className="p-6 border-b border-outline-variant/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">architecture</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-on-surface">The Fluid Architect</h2>
              <p className="text-xs text-on-surface-variant">{user?.email ?? ''}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {NAV.map(({ href, label, icon }) => {
            const active =
              pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all text-sm font-medium ${
                  active
                    ? 'bg-primary-container text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {icon}
                </span>
                <span>{label}</span>
              </Link>
            );
          })}

          {/* Starred Section */}
          <div className="mt-8 pt-6 border-t border-outline-variant/10">
            <p className="px-4 text-xs font-bold text-on-surface-variant mb-3">
              ESSENCIAL
            </p>
            <Link
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-full transition-all text-sm font-medium text-on-surface-variant hover:bg-surface-container-high"
            >
              <span className="material-symbols-outlined text-[20px]">
                star
              </span>
              <span>Favoritos</span>
            </Link>
          </div>
        </nav>

        {/* User Profile and Logout */}
        <div className="border-t border-outline-variant/10 p-4 space-y-3">
          <div className="px-3">
            <p className="text-xs font-bold text-on-surface mb-1">
              {user?.name ?? 'User'}
            </p>
            <p className="text-xs text-on-surface-variant">
              {user?.email ?? ''}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-full text-error hover:bg-error/10 transition-all text-sm font-medium"
          >
            <span className="material-symbols-outlined text-[18px]">
              logout
            </span>
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
