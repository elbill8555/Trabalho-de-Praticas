// Client-side auth helpers (localStorage + Bearer token)

const TOKEN_KEY = 'tarefas_token';
const USER_KEY  = 'tarefas_user';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

// ─── Token ──────────────────────────────────────────────
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ─── User ──────────────────────────────────────────────
export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as AuthUser; } catch { return null; }
}

export function setUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// ─── Authenticated fetch ───────────────────────────────
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

console.log('[AUTH] BASE_URL configured as:', BASE_URL);

export async function apiFetch<T = unknown>(
  path: string,
  opts: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const fullUrl = `${BASE_URL}${path}`;
  console.log('[APIFETCH] requesting:', {
    method: opts.method || 'GET',
    url: fullUrl,
    hasToken: !!token,
  });

  try {
    const res = await fetch(fullUrl, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(opts.headers ?? {}),
      },
    });

    console.log('[APIFETCH] response status:', res.status);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const errorMsg = (body as any).message ?? `HTTP ${res.status}`;
      console.error('[APIFETCH] error response:', errorMsg);
      throw new Error(errorMsg);
    }

    // 204 No Content
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  } catch (error) {
    console.error('[APIFETCH] fetch error:', error);
    throw error;
  }
}
