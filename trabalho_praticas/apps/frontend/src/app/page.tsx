import { api } from '@/lib/api';

interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
  version: string;
}

async function getHealthStatus(): Promise<HealthResponse | null> {
  try {
    const res = await api('/api/v1/health', { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const health = await getHealthStatus();

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-surface)',
        fontFamily: 'var(--font-body)',
        padding: '2rem',
      }}
    >
      <div
        style={{
          background: 'var(--color-surface-lowest)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-ambient)',
          padding: '3rem',
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.75rem',
            fontWeight: 700,
            color: 'var(--color-primary)',
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em',
          }}
        >
          Tarefas
        </h1>
        <p
          style={{
            color: 'var(--color-on-surface-variant)',
            fontSize: '0.875rem',
            marginBottom: '2rem',
          }}
        >
          Scaffold monorepo — validação de integração
        </p>

        <div
          style={{
            background: health ? '#f0fdf4' : '#fff5f5',
            border: `1px solid ${health ? '#bbf7d0' : '#fecaca'}`,
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.25rem' }}>{health ? '🟢' : '🔴'}</span>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                color: health ? '#15803d' : '#dc2626',
              }}
            >
              Backend {health ? 'online' : 'offline'}
            </span>
          </div>

          {health ? (
            <pre
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-on-surface-variant)',
                background: 'transparent',
                margin: 0,
                whiteSpace: 'pre-wrap',
              }}
            >
              {JSON.stringify(health, null, 2)}
            </pre>
          ) : (
            <p style={{ fontSize: '0.75rem', color: '#dc2626', margin: 0 }}>
              Não foi possível conectar em{' '}
              <code>{process.env.NEXT_PUBLIC_API_URL}/api/v1/health</code>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
