'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getToken, getUser, clearAuth } from '@/lib/auth';
import AiChat from './AiChat';

/* ── Navigation items — matches Stitch dashboard prototype ── */
const NAV_ITEMS = [
  { href: '/dashboard', label: 'My Tasks',  icon: 'assignment' },
  { href: '/tasks',     label: 'Inbox',      icon: 'inbox' },
  { href: '/projects',  label: 'Projects',   icon: 'folder_open' },
  { href: '/profile',   label: 'Profile',    icon: 'person' },
];

const TOP_NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/projects',  label: 'Projects' },
  { href: '/tasks',     label: 'My Tasks' },
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

  const firstName = user?.name?.split(' ')[0] ?? 'User';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-surface)' }}>

      {/* ── TOP NAV BAR ─────────────────────────────────────────────
          Stitch spec: fixed, h-16, backdrop-blur-xl, shadow azul suave
          ─────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        height: 'var(--header-h)',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(194,198,212,0.20)',
        boxShadow: 'var(--shadow-nav)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2rem',
      }}>
        {/* Left: brand + nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
          <span style={{
            fontFamily: 'var(--font-heading)', fontSize: '1.25rem',
            fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-on-surface)',
          }}>
            The Fluid Architect
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {TOP_NAV.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link key={href} href={href} style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.875rem', fontWeight: 600,
                  letterSpacing: '-0.01em',
                  color: active ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                  borderBottom: active ? '2px solid var(--color-primary)' : '2px solid transparent',
                  paddingBottom: '2px',
                  transition: 'color 0.2s',
                  textDecoration: 'none',
                }}>
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: New Task + icons + avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/tasks" style={{
            background: 'linear-gradient(135deg, #003f87 0%, #0056b3 100%)',
            color: '#ffffff',
            padding: '0.5rem 1.5rem',
            borderRadius: '0.75rem',
            fontSize: '0.875rem', fontWeight: 600,
            textDecoration: 'none',
            transition: 'opacity 0.15s',
          }} onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
             onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            New Task
          </Link>

          {/* Notification */}
          <button aria-label="Notificações" style={{
            padding: '0.5rem', borderRadius: '9999px',
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f5')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-on-surface-variant)', fontSize: '22px' }}>
              notifications
            </span>
          </button>

          {/* Settings → profile */}
          <Link href="/profile" aria-label="Perfil" style={{
            padding: '0.5rem', borderRadius: '9999px',
            transition: 'background 0.15s', display: 'inline-flex',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f5')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-on-surface-variant)', fontSize: '22px' }}>
              settings
            </span>
          </Link>

          {/* Avatar */}
          <div style={{
            width: 34, height: 34, borderRadius: '9999px',
            background: 'linear-gradient(135deg, #003f87 0%, #0056b3 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '0.8125rem', fontWeight: 700,
            cursor: 'pointer', flexShrink: 0,
          }}>
            {firstName.charAt(0).toUpperCase()}
          </div>
        </div>
      </nav>

      {/* ── SIDE NAV BAR ────────────────────────────────────────────
          Stitch spec: fixed, w-64, sem borda sólida, active = rounded-r-full
          ─────────────────────────────────────────────────────────── */}
      <aside style={{
        position: 'fixed', left: 0, top: 0, bottom: 0,
        width: 'var(--sidebar-w)',
        paddingTop: 'var(--header-h)',
        background: 'var(--color-surface)',
        display: 'flex', flexDirection: 'column',
        zIndex: 40,
        /* Sem borderRight — No-Line Rule */
      }}>
        {/* Workspace badge */}
        <div style={{ padding: '1.5rem 1.5rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 40, height: 40,
              background: 'var(--color-primary-container)',
              borderRadius: '0.5rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ffffff',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>architecture</span>
            </div>
            <div>
              <p style={{
                fontSize: '1.0625rem', fontWeight: 900,
                color: 'var(--color-on-surface)', letterSpacing: '-0.02em', lineHeight: 1.2,
              }}>Workspace</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', fontWeight: 500 }}>
                {user?.email ?? 'Fluid Architect'}
              </p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, paddingTop: '0.5rem' }}>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {NAV_ITEMS.map(({ href, label, icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <li key={href}>
                  <Link href={href} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem 1.5rem',
                    /* Active: rounded-r-full — Stitch spec */
                    borderRadius: active ? '0 9999px 9999px 0' : '0',
                    background: active ? 'var(--color-surface-high)' : 'transparent',
                    color: active ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                    fontWeight: active ? 700 : 400,
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    transition: 'background 0.2s, transform 0.2s',
                    marginRight: '0',   /* permite rounded-r-full ir até a borda */
                  }}
                    onMouseEnter={e => {
                      if (!active) {
                        e.currentTarget.style.background = 'var(--color-surface-low)';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }
                    }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>{icon}</span>
                    <span>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom: Upgrade + Help + Logout */}
        <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', borderRadius: '0.75rem' }}>
            Upgrade Plan
          </button>
          <div style={{ borderTop: '1px solid rgba(194,198,212,0.15)', paddingTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <Link href="/profile" style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.5rem 0.5rem', borderRadius: '0.5rem',
              color: 'var(--color-on-surface-variant)', fontSize: '0.875rem',
              textDecoration: 'none', transition: 'background 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-low)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>help</span>
              <span>Help Center</span>
            </Link>
            <button onClick={handleLogout} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.5rem 0.5rem', borderRadius: '0.5rem',
              color: 'var(--color-on-surface-variant)', fontSize: '0.875rem',
              background: 'transparent', border: 'none', cursor: 'pointer',
              transition: 'background 0.15s', width: '100%',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-surface-low)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
      <main style={{
        marginLeft: 'var(--sidebar-w)',
        marginTop: 'var(--header-h)',
        flex: 1,
        minHeight: 'calc(100vh - var(--header-h))',
        background: 'var(--color-surface)',
        overflow: 'auto',
      }}>
        {children}
      </main>

      <AiChat />
    </div>
  );
}
