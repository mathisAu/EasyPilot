import { FileCheck2, FileText, Search, Sparkles, SlidersHorizontal } from 'lucide-react';
import type { FieldOption, RequestStatus, Stage, Tone } from './types';

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

export const stages: Stage[] = [
  { label: 'Aangeleverd', value: 3, icon: FileText, tone: 'sky' },
  { label: 'In beoordeling', value: 2, icon: Search, tone: 'blue' },
  { label: 'Inleren', value: 2, icon: Sparkles, tone: 'violet' },
  { label: 'Testen', value: 2, icon: SlidersHorizontal, tone: 'amber' },
  { label: 'Correctie nodig', value: 1, icon: FileCheck2, tone: 'orange' },
  { label: 'Goedgekeurd', value: 4, icon: FileCheck2, tone: 'emerald' },
  { label: 'Live', value: 8, icon: Sparkles, tone: 'blue' },
];

export function toneFor(status: RequestStatus): Tone {
  return stages.find((stage) => stage.label === status)?.tone ?? 'slate';
}

