const isServer = typeof window === 'undefined';
const BASE_URL = isServer
  ? (process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');

export function api(path: string, opts?: RequestInit): Promise<Response> {
  return fetch(`${BASE_URL}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(opts?.headers ?? {}),
    },
  });
}
