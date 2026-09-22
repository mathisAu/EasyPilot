import { apiFetch } from './client';
import type { DocumentFile, DocumentType } from '../types';

interface BackendDocumentTypeDto {
  id: number;
  name: string;
  provider: string;
  live: boolean;
  fields: string[];
  documentCount: number;
  organizationId: number | null;
  organizationName: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BackendDocumentDto {
  id: number;
  documentTypeId: number;
  filename: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
  downloadUrl: string;
}

export interface DocumentTypeInput {
  name: string;
  provider: string;
  live: boolean;
  fields: string[];
}

function mapType(dto: BackendDocumentTypeDto): DocumentType {
  return {
    id: dto.id,
    name: dto.name,
    provider: dto.provider,
    live: dto.live,
    fieldList: dto.fields,
    examples: dto.documentCount,
    organizationId: dto.organizationId,
    organizationName: dto.organizationName,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

function mapDocument(dto: BackendDocumentDto): DocumentFile {
  return {
    id: dto.id,
    documentTypeId: dto.documentTypeId,
    filename: dto.filename,
    contentType: dto.contentType,
    sizeBytes: dto.sizeBytes,
    uploadedAt: dto.uploadedAt,
    downloadUrl: dto.downloadUrl,
  };
}

export async function listDocumentTypes(): Promise<DocumentType[]> {
  const result = await apiFetch<BackendDocumentTypeDto[]>('/api/document-types');
  return result.map(mapType);
}

export async function createDocumentType(input: DocumentTypeInput): Promise<DocumentType> {
  const result = await apiFetch<BackendDocumentTypeDto>('/api/document-types', { method: 'POST', json: input });
  return mapType(result);
}

export async function updateDocumentType(id: number, input: DocumentTypeInput): Promise<DocumentType> {
  const result = await apiFetch<BackendDocumentTypeDto>(`/api/document-types/${id}`, { method: 'PUT', json: input });
  return mapType(result);
}

export async function deleteDocumentType(id: number): Promise<void> {
  await apiFetch<void>(`/api/document-types/${id}`, { method: 'DELETE' });
}

export async function listDocuments(typeId: number): Promise<DocumentFile[]> {
  const result = await apiFetch<BackendDocumentDto[]>(`/api/document-types/${typeId}/documents`);
  return result.map(mapDocument);
}

export async function uploadDocument(typeId: number, file: File): Promise<DocumentFile> {
  const formData = new FormData();
  formData.append('file', file);
  const result = await apiFetch<BackendDocumentDto>(`/api/document-types/${typeId}/documents`, {
    method: 'POST',
    formData,
  });
  return mapDocument(result);
}

export async function deleteDocument(id: number): Promise<void> {
  await apiFetch<void>(`/api/documents/${id}`, { method: 'DELETE' });
}

export function downloadUrl(id: number): string {
  return `/api/documents/${id}/download`;
}
