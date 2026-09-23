import { apiFetch, ApiError } from './client';

export interface AuthUser {
  username: string;
  displayName: string | null;
  email: string | null;
  role: 'ADMIN' | 'CUSTOMER';
  organizationId: number | null;
  organizationName: string | null;
  totpEnabled: boolean;
}

export class TotpRequiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TotpRequiredError';
  }
}

export async function login(username: string, password: string, totpCode?: string): Promise<AuthUser> {
  try {
    return await apiFetch<AuthUser>('/api/auth/login', { method: 'POST', json: { username, password, totpCode } });
  } catch (err) {
    if (err instanceof ApiError && err.status === 428) {
      throw new TotpRequiredError(err.message);
    }
    throw err;
  }
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
