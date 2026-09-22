import { apiFetch, ApiError } from './client';

export interface AuthUser {
  username: string;
  role: 'ADMIN' | 'CUSTOMER';
  organizationId: number | null;
  organizationName: string | null;
}

export async function login(username: string, password: string): Promise<AuthUser> {
  return apiFetch<AuthUser>('/api/auth/login', { method: 'POST', json: { username, password } });
}

export async function logout(): Promise<void> {
  await apiFetch<void>('/api/auth/logout', { method: 'POST' });
}

export async function me(): Promise<AuthUser | null> {
  try {
    return await apiFetch<AuthUser>('/api/auth/me');
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      return null;
    }
    throw err;
  }
}
