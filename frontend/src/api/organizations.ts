import { apiFetch } from './client';
import type { Organization, OrganizationDetails } from '../types';

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

export async function uploadMyLogo(file: File): Promise<Organization> {
  const formData = new FormData();
  formData.append('file', file);
  return apiFetch<Organization>('/api/organizations/me/logo', { method: 'POST', formData });
}

export async function deleteMyLogo(): Promise<Organization> {
  return apiFetch<Organization>('/api/organizations/me/logo', { method: 'DELETE' });
}

/** Includes the upload time so a replaced logo isn't served from the browser cache. */
export function logoUrl(organization: Organization): string | null {
  if (!organization.logoUpdatedAt) return null;
  return `/api/organizations/${organization.id}/logo?v=${encodeURIComponent(organization.logoUpdatedAt)}`;
}

export async function updateMyOrganization(details: OrganizationDetails): Promise<Organization> {
  return apiFetch<Organization>('/api/organizations/me', { method: 'PATCH', json: details });
}
