import { apiFetch } from './client';
import type { Folder } from '../types';

export async function listFolders(): Promise<Folder[]> {
  return apiFetch<Folder[]>('/api/folders');
}

export async function createFolder(name: string): Promise<Folder> {
  return apiFetch<Folder>('/api/folders', { method: 'POST', json: { name } });
}

export async function deleteFolder(id: number): Promise<void> {
  await apiFetch<void>(`/api/folders/${id}`, { method: 'DELETE' });
}
