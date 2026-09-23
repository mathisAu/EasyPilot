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

export type PageKey =
  | 'Dashboard'
  | 'Documentaanvragen'
  | 'Documenttypes'
  | 'Organisaties'
  | 'Instellingen'
  | 'Help & support';

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
  latestDocumentFilename?: string | null;
  latestDocumentId?: number | null;
  organizationId?: number | null;
  organizationName?: string | null;
  folderId?: number | null;
  folderName?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Folder {
  id: number;
  name: string;
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
  included: boolean;
  hasLocation: boolean;
  updatedAt: string;
}

export interface Organization {
  id: number;
  name: string;
  customerUsername: string | null;
  documentTypeCount: number;
  createdAt: string;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  kvkNumber: string | null;
  vatNumber: string | null;
  website: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
}

export type OrganizationDetails = Pick<
  Organization,
  'address' | 'postalCode' | 'city' | 'kvkNumber' | 'vatNumber' | 'website' | 'contactName' | 'contactEmail' | 'contactPhone'
>;

export interface WizardFormData {
  customer: string;
  provider: string;
  type: string;
  files: UploadedFile[];
  selectedFields: Record<string, boolean>;
  customFields: string[];
}

export type TicketStatus = 'OPEN' | 'CLOSED';

export interface TicketMessage {
  id: number;
  authorName: string;
  authorRole: 'ADMIN' | 'CUSTOMER';
  body: string;
  edited: boolean;
  mine: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface TicketSummary {
  id: number;
  subject: string;
  status: TicketStatus;
  organizationName: string | null;
  createdByName: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TicketDetail {
  id: number;
  subject: string;
  status: TicketStatus;
  organizationName: string | null;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

export type NotificationTargetType = 'TICKET' | 'DOCUMENT_TYPE';

export interface AppNotification {
  id: number;
  title: string;
  body: string;
  targetType: NotificationTargetType;
  targetId: number;
  read: boolean;
  createdAt: string;
}
