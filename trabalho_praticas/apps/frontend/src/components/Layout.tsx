'use client';

import { ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getUser, clearAuth } from '@/lib/auth';

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = typeof window !== 'undefined' ? getUser() : null;

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const navigation = [
    { label: 'Dashboard', href: '/dashboard', icon: 'assignment' },
    { label: 'Projects', href: '/projects', icon: 'folder_open' },
    { label: 'Tasks', href: '/tasks', icon: 'task_alt' },
  ];

  const sidebarItems = [
    { label: 'My Tasks', href: '/dashboard', icon: 'assignment' },
    { label: 'Inbox', href: '/dashboard?view=inbox', icon: 'inbox' },
    { label: 'Starred', href: '/dashboard?view=starred', icon: 'star' },
    { label: 'Completed', href: '/dashboard?view=completed', icon: 'check_circle' },
    { label: 'Archive', href: '/dashboard?view=archive', icon: 'archive' },
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl flex justify-between items-center px-8 h-16 border-b border-outline-variant/20 shadow-sm">
        <div className="flex items-center gap-12">
          <Link href="/dashboard" className="text-xl font-bold tracking-tighter text-on-surface">
            The Fluid Architect
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-semibold text-sm transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'text-primary border-b-2 border-primary pb-1'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gradient-to-br from-primary to-primary-container text-white px-6 py-2 rounded-xl font-semibold text-sm active:scale-95 duration-150 hover:shadow-lg transition-all"
          >
            New Task
          </button>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="p-2 rounded-full hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant">settings</span>
            </button>
          </div>
          <div className="flex items-center gap-3 ml-2 pl-2 border-l border-outline-variant/20">
            <div className="text-right text-sm">
              <p className="font-semibold text-on-surface">{user?.name || 'User'}</p>
              <p className="text-xs text-on-surface-variant">{user?.email || 'user@example.com'}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-full hover:bg-error/10 transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-lg">logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* SideNavBar */}
        <aside className="h-screen w-64 fixed left-0 top-0 pt-20 bg-surface dark:bg-slate-950 flex flex-col py-6 border-r border-outline-variant/20">
          <div className="px-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center text-white">
                <span className="material-symbols-outlined">architecture</span>
              </div>
              <div>
                <p className="text-lg font-black text-on-surface leading-tight">Workspace</p>
                <p className="text-xs text-on-surface-variant font-medium">Premium Plan</p>
              </div>
            </div>
          </div>

          <nav className="flex-1">
            <ul className="space-y-1">
              {sidebarItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`px-6 py-3 flex items-center gap-3 transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-surface-container-high text-primary rounded-r-full font-bold hover:translate-x-1'
                        : 'text-on-surface-variant hover:bg-surface-container-low hover:translate-x-1 rounded-r-lg'
                    }`}
                  >
                    <span className="material-symbols-outlined">{item.icon}</span>
                    <span className="font-inter text-sm">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="px-6 mt-auto space-y-4">
            <button className="w-full bg-secondary-container text-on-secondary-container py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
              Upgrade Plan
            </button>
            <div className="pt-4 border-t border-outline-variant/20 space-y-1">
              <a
                href="#"
                className="text-on-surface-variant py-2 flex items-center gap-3 hover:bg-surface-container-low transition-all px-2 rounded-lg"
              >
                <span className="material-symbols-outlined text-lg">help</span>
                <span className="text-sm">Help Center</span>
              </a>
              <button
                onClick={handleLogout}
                className="w-full text-left text-on-surface-variant py-2 flex items-center gap-3 hover:bg-surface-container-low transition-all px-2 rounded-lg"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
                <span className="text-sm">Log Out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1 min-h-screen p-10 bg-surface">
          <div className="max-w-5xl mx-auto">{children}</div>
        </main>
      </div>

      {/* FAB Button */}
      <button
        onClick={() => router.push('/dashboard')}
        className="fixed bottom-10 right-10 bg-primary text-white p-5 rounded-full shadow-lg shadow-primary/20 hover:bg-primary-container transition-all hover:scale-110 active:scale-90 z-40"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </div>
  );
}
