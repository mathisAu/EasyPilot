import { apiFetch } from './client';
import type { DocumentFile, DocumentType, ExtractedField, RequestStatus } from '../types';

interface BackendDocumentTypeDto {
  id: number;
  name: string;
  provider: string;
  status: string;
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
  extractionStatus: DocumentFile['extractionStatus'];
  extractionError: string | null;
}

interface BackendExtractedFieldDto {
  fieldName: string;
  value: string | null;
  edited: boolean;
  updatedAt: string;
}

const STATUS_FROM_BACKEND: Record<string, RequestStatus> = {
  AANGELEVERD: 'Aangeleverd',
  IN_BEOORDELING: 'In beoordeling',
  INLEREN: 'Inleren',
  TESTEN: 'Testen',
  CORRECTIE_NODIG: 'Correctie nodig',
  GOEDGEKEURD: 'Goedgekeurd',
  LIVE: 'Live',
};

const STATUS_TO_BACKEND: Record<RequestStatus, string> = {
  Aangeleverd: 'AANGELEVERD',
  'In beoordeling': 'IN_BEOORDELING',
  Inleren: 'INLEREN',
  Testen: 'TESTEN',
  'Correctie nodig': 'CORRECTIE_NODIG',
  Goedgekeurd: 'GOEDGEKEURD',
  Live: 'LIVE',
};

export interface DocumentTypeInput {
  name: string;
  provider: string;
  status: RequestStatus;
  fields: string[];
}

function mapType(dto: BackendDocumentTypeDto): DocumentType {
  return {
    id: dto.id,
    name: dto.name,
    provider: dto.provider,
    status: STATUS_FROM_BACKEND[dto.status] ?? 'Aangeleverd',
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
    extractionStatus: dto.extractionStatus,
    extractionError: dto.extractionError,
  };
}

function mapExtractedField(dto: BackendExtractedFieldDto): ExtractedField {
  return {
    fieldName: dto.fieldName,
    value: dto.value,
    edited: dto.edited,
    updatedAt: dto.updatedAt,
  };
}

function toBackendInput(input: DocumentTypeInput) {
  return {
    name: input.name,
    provider: input.provider,
    status: STATUS_TO_BACKEND[input.status],
    fields: input.fields,
  };
}

export async function listDocumentTypes(): Promise<DocumentType[]> {
  const result = await apiFetch<BackendDocumentTypeDto[]>('/api/document-types');
  return result.map(mapType);
}

export async function createDocumentType(input: DocumentTypeInput): Promise<DocumentType> {
  const result = await apiFetch<BackendDocumentTypeDto>('/api/document-types', { method: 'POST', json: toBackendInput(input) });
  return mapType(result);
}

export async function updateDocumentType(id: number, input: DocumentTypeInput): Promise<DocumentType> {
  const result = await apiFetch<BackendDocumentTypeDto>(`/api/document-types/${id}`, {
    method: 'PUT',
    json: toBackendInput(input),
  });
  return mapType(result);
}

export async function updateDocumentTypeStatus(id: number, status: RequestStatus): Promise<DocumentType> {
  const result = await apiFetch<BackendDocumentTypeDto>(`/api/document-types/${id}/status`, {
    method: 'PATCH',
    json: { status: STATUS_TO_BACKEND[status] },
  });
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

export function previewUrl(id: number): string {
  return `/api/documents/${id}/download?disposition=inline`;
}

export function summaryUrl(id: number): string {
  return `/api/documents/${id}/summary`;
}

export async function getExtractedFields(documentId: number): Promise<ExtractedField[]> {
  const result = await apiFetch<BackendExtractedFieldDto[]>(`/api/documents/${documentId}/extracted-fields`);
  return result.map(mapExtractedField);
}

export async function updateExtractedFields(
  documentId: number,
  fields: { fieldName: string; value: string }[]
): Promise<ExtractedField[]> {
  const result = await apiFetch<BackendExtractedFieldDto[]>(`/api/documents/${documentId}/extracted-fields`, {
    method: 'PUT',
    json: fields,
  });
  return result.map(mapExtractedField);
}

export async function retryExtraction(documentId: number): Promise<void> {
  await apiFetch<void>(`/api/documents/${documentId}/extract`, { method: 'POST' });
}
