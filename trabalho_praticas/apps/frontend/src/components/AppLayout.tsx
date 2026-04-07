'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getToken, getUser, clearAuth } from '@/lib/auth';

const NAV = [
  { href: '/dashboard', label: 'Dashboard',  icon: '◈' },
  { href: '/tasks',     label: 'Tarefas',     icon: '✓' },
  { href: '/projects',  label: 'Projetos',    icon: '◉' },
  { href: '/profile',   label: 'Perfil',      icon: '◎' },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const user     = getUser();

  useEffect(() => {
    if (!getToken()) router.replace('/login');
  }, [router]);

  function handleLogout() {
    clearAuth();
    router.push('/login');
  }

  if (!getToken()) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 'var(--sidebar-w)', flexShrink: 0,
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sidebar)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
      }}>
        {/* Brand */}
        <div style={{ padding: '1.5rem 1.25rem 1rem', borderBottom: '1px solid var(--color-border)' }}>
          <span style={{
            fontFamily: 'var(--font-heading)', fontSize: '1.25rem',
            fontWeight: 800, color: 'var(--color-primary)',
          }}>Tarefas</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {NAV.map(({ href, label, icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link key={href} href={href} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem', fontWeight: active ? 600 : 400,
                color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                background: active ? 'var(--color-primary-container)' : 'transparent',
                transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: '1rem', opacity: 0.8 }}>{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
            {user?.name ?? ''}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
            {user?.email ?? ''}
          </div>
          <button className="btn-ghost" onClick={handleLogout}
            style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.8125rem', color: 'var(--color-error)' }}>
            ↩ Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto', background: 'var(--color-bg)' }}>
        {children}
      </main>
    </div>
  );
}
