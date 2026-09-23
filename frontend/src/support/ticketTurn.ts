import type { TicketStatus } from '../types';

export interface TicketTurn {
  label: string;
  /** status-pill tone class suffix */
  tone: 'amber' | 'blue' | 'slate';
  description: string;
}

/**
 * Whose move it is on a ticket, phrased for the person looking at it: the side
 * that did not write the latest message is the one expected to respond.
 */
export function ticketTurn(
  status: TicketStatus,
  lastMessageAuthorRole: 'ADMIN' | 'CUSTOMER' | null,
  viewerRole: 'ADMIN' | 'CUSTOMER' | undefined
): TicketTurn {
  if (status === 'CLOSED') {
    return { label: 'Gesloten', tone: 'slate', description: 'Dit ticket is afgehandeld.' };
  }
  const supportMustRespond = lastMessageAuthorRole !== 'ADMIN';
  if (viewerRole === 'ADMIN') {
    return supportMustRespond
      ? { label: 'Reactie vereist', tone: 'amber', description: 'De klant wacht op een reactie.' }
      : { label: 'Wacht op klant', tone: 'blue', description: 'Support heeft gereageerd; de klant is aan zet.' };
  }
  return supportMustRespond
    ? { label: 'In behandeling bij support', tone: 'blue', description: 'Ons supportteam reageert zo snel mogelijk.' }
    : { label: 'Wacht op jouw reactie', tone: 'amber', description: 'Support heeft gereageerd.' };
}
