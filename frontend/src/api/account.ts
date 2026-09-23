import { apiFetch } from './client';
import type { AuthUser } from './auth';

export interface UpdateProfileInput {
  displayName: string;
  email: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface TotpSetupResponse {
  secret: string;
  otpAuthUri: string;
}

export async function updateProfile(input: UpdateProfileInput): Promise<AuthUser> {
  return apiFetch<AuthUser>('/api/account/profile', { method: 'PATCH', json: input });
}

export async function changePassword(input: ChangePasswordInput): Promise<void> {
  await apiFetch<void>('/api/account/password', { method: 'POST', json: input });
}

export async function setupTwoFactor(): Promise<TotpSetupResponse> {
  return apiFetch<TotpSetupResponse>('/api/account/2fa/setup', { method: 'POST' });
}

export async function enableTwoFactor(code: string): Promise<AuthUser> {
  return apiFetch<AuthUser>('/api/account/2fa/enable', { method: 'POST', json: { code } });
}

export async function disableTwoFactor(code: string): Promise<AuthUser> {
  return apiFetch<AuthUser>('/api/account/2fa/disable', { method: 'POST', json: { code } });
}
