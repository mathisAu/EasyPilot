import type { LucideIcon } from 'lucide-react';

export type Tone = 'blue' | 'amber' | 'violet' | 'slate' | 'green' | 'orange' | 'sky' | 'emerald';

export type RequestStatus =
  | 'Aangeleverd'
  | 'In beoordeling'
  | 'Inleren'
  | 'Testen'
  | 'Correctie nodig'
  | 'Goedgekeurd'
  | 'Live';

export type PageKey = 'Dashboard' | 'Documentaanvragen' | 'Documenttypes' | 'Organisaties';

export interface UploadedFile {
  id: string;
  name: string;
  sizeLabel: string;
}

export interface FieldOption {
  key: string;
  label: string;
  example: string;
}

export interface Stage {
  label: RequestStatus;
  value: number;
  icon: LucideIcon;
  tone: Tone;
}

export interface DocumentType {
  id: number;
  name: string;
  provider: string;
  examples: number;
  status: RequestStatus;
  fieldList: string[];
  organizationId?: number | null;
  organizationName?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentFile {
  id: number;
  documentTypeId: number;
  filename: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
  downloadUrl: string;
  extractionStatus: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'FAILED' | 'SKIPPED';
  extractionError: string | null;
}

export interface ExtractedField {
  fieldName: string;
  value: string | null;
  edited: boolean;
  updatedAt: string;
}

export interface Organization {
  id: number;
  name: string;
  customerUsername: string | null;
  documentTypeCount: number;
  createdAt: string;
}

export interface WizardFormData {
  customer: string;
  provider: string;
  type: string;
  files: UploadedFile[];
  selectedFields: Record<string, boolean>;
  customFields: string[];
}
