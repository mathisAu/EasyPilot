import { FileCheck2, FileText, Search, Sparkles, SlidersHorizontal } from 'lucide-react';
import type { DocumentRequest, DocumentType, FieldOption, Organization, Stage } from './types';

export const STANDARD_FIELDS: FieldOption[] = [
  { key: 'ordernummer', label: 'Ordernummer', example: 'bijv. 458921' },
  { key: 'laaddatum', label: 'Laaddatum', example: 'bijv. 16-09-2026' },
  { key: 'laadtijd', label: 'Laadtijd', example: 'bijv. 08:00' },
  { key: 'laadadres', label: 'Laadadres', example: 'bijv. Amsterdam' },
  { key: 'losdatum', label: 'Losdatum', example: 'bijv. 16-09-2026' },
  { key: 'lostijd', label: 'Lostijd', example: 'bijv. 12:00' },
  { key: 'losadres', label: 'Losadres', example: 'bijv. Utrecht' },
  { key: 'referentie', label: 'Referentie', example: 'bijv. REF-99281' },
  { key: 'gewicht', label: 'Gewicht', example: 'bijv. 12.500 kg' },
  { key: 'colli', label: 'Aantal pallets / colli', example: 'bijv. 14' },
  { key: 'laadmeters', label: 'Laadmeters', example: 'bijv. 8,4' },
  { key: 'contactpersoon', label: 'Contactpersoon', example: '' },
  { key: 'telefoonnummer', label: 'Telefoonnummer', example: '' },
  { key: 'opmerkingen', label: 'Opmerkingen', example: '' },
];

export const DEFAULT_SELECTED_FIELDS = new Set([
  'ordernummer',
  'laaddatum',
  'laadtijd',
  'laadadres',
  'losdatum',
  'lostijd',
  'losadres',
  'referentie',
  'gewicht',
  'colli',
  'laadmeters',
]);

export const STAGE_ORDER: Stage['label'][] = [
  'Aangeleverd',
  'In beoordeling',
  'Inleren',
  'Testen',
  'Correctie nodig',
  'Goedgekeurd',
  'Live',
];

export const initialRequests: DocumentRequest[] = [
  {
    id: 'req-1',
    customer: 'Zeelte Transport',
    type: 'Transportopdracht',
    provider: 'BMN',
    date: '14-09-2026',
    status: 'In beoordeling',
    tone: 'blue',
    exampleCount: 7,
    fields: ['Ordernummer', 'Laaddatum', 'Laadadres', 'Losadres', 'Gewicht'],
  },
  {
    id: 'req-2',
    customer: 'Van Dijk Logistics',
    type: 'Transportopdracht',
    provider: 'DHL',
    date: '13-09-2026',
    status: 'Inleren',
    tone: 'amber',
    exampleCount: 5,
    fields: ['Ordernummer', 'Laaddatum', 'Referentie', 'Gewicht', 'Laadmeters'],
  },
  {
    id: 'req-3',
    customer: 'Koster Transport',
    type: 'Laadlijst',
    provider: 'Vos',
    date: '12-09-2026',
    status: 'Testen',
    tone: 'violet',
    exampleCount: 6,
    fields: ['Ordernummer', 'Losadres', 'Aantal pallets / colli'],
  },
  {
    id: 'req-4',
    customer: 'Jansen Transport',
    type: 'Transportopdracht',
    provider: 'XPO',
    date: '10-09-2026',
    status: 'Aangeleverd',
    tone: 'slate',
    exampleCount: 3,
    fields: ['Ordernummer', 'Laaddatum', 'Laadadres'],
  },
];

export const stages: Stage[] = [
  { label: 'Aangeleverd', value: 3, icon: FileText, tone: 'sky' },
  { label: 'In beoordeling', value: 2, icon: Search, tone: 'blue' },
  { label: 'Inleren', value: 2, icon: Sparkles, tone: 'violet' },
  { label: 'Testen', value: 2, icon: SlidersHorizontal, tone: 'amber' },
  { label: 'Correctie nodig', value: 1, icon: FileCheck2, tone: 'orange' },
  { label: 'Goedgekeurd', value: 4, icon: FileCheck2, tone: 'emerald' },
  { label: 'Live', value: 8, icon: Sparkles, tone: 'blue' },
];

export const documentTypes: DocumentType[] = [
  {
    id: 'type-1',
    name: 'Transportopdracht',
    provider: 'BMN',
    examples: 7,
    live: true,
    fieldList: ['Ordernummer', 'Laaddatum', 'Laadadres', 'Losadres', 'Gewicht', 'Referentie'],
  },
  {
    id: 'type-2',
    name: 'Transportopdracht',
    provider: 'DHL',
    examples: 5,
    live: true,
    fieldList: ['Ordernummer', 'Laaddatum', 'Referentie', 'Gewicht', 'Laadmeters'],
  },
  {
    id: 'type-3',
    name: 'Laadlijst',
    provider: 'Vos',
    examples: 6,
    live: false,
    fieldList: ['Ordernummer', 'Losadres', 'Aantal pallets / colli', 'Laadmeters'],
  },
  {
    id: 'type-4',
    name: 'Transportopdracht',
    provider: 'XPO',
    examples: 3,
    live: false,
    fieldList: ['Ordernummer', 'Laaddatum', 'Laadadres', 'Losadres', 'Gewicht', 'Referentie', 'Laadmeters'],
  },
];

export const organizations: Organization[] = [
  { id: 'org-1', name: 'Zeelte Transport', activeTypes: 1, lastActivity: 'Vandaag' },
  { id: 'org-2', name: 'Van Dijk Logistics', activeTypes: 2, lastActivity: 'Vandaag' },
  { id: 'org-3', name: 'Koster Transport', activeTypes: 3, lastActivity: 'Gisteren' },
  { id: 'org-4', name: 'Jansen Transport', activeTypes: 4, lastActivity: '2 dagen geleden' },
];
