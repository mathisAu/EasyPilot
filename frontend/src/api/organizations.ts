import { apiFetch } from './client';
import type { Organization } from '../types';

export interface CreateOrganizationInput {
  name: string;
  customerUsername: string;
  customerPassword: string;
}

export async function listOrganizations(): Promise<Organization[]> {
  return apiFetch<Organization[]>('/api/organizations');
}

export async function createOrganization(input: CreateOrganizationInput): Promise<Organization> {
  return apiFetch<Organization>('/api/organizations', { method: 'POST', json: input });
}

export async function getMyOrganization(): Promise<Organization> {
  return apiFetch<Organization>('/api/organizations/me');
}

export async function deleteUserAccount(username: string): Promise<void> {
  await apiFetch<void>(`/api/account/admin/users/${encodeURIComponent(username)}`, { method: 'DELETE' });
}
