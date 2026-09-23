import { apiFetch } from './client';
import type { TicketDetail, TicketDraft, TicketMessage, TicketStatus, TicketSummary } from '../types';

export async function listDrafts(): Promise<TicketDraft[]> {
  return apiFetch<TicketDraft[]>('/api/support/drafts');
}

export async function getReplyDraft(ticketId: number): Promise<TicketDraft | null> {
  return (await apiFetch<TicketDraft | undefined>(`/api/support/drafts/reply/${ticketId}`)) ?? null;
}

/** An empty body deletes the reply draft. */
export async function saveReplyDraft(ticketId: number, body: string): Promise<TicketDraft | null> {
  const result = await apiFetch<TicketDraft | undefined>(`/api/support/drafts/reply/${ticketId}`, {
    method: 'PUT',
    json: { body },
  });
  return result ?? null;
}

export async function createTicketDraft(input: { subject: string; body: string }): Promise<TicketDraft> {
  return apiFetch<TicketDraft>('/api/support/drafts', { method: 'POST', json: input });
}

export async function updateTicketDraft(id: number, input: { subject: string; body: string }): Promise<TicketDraft> {
  return apiFetch<TicketDraft>(`/api/support/drafts/${id}`, { method: 'PUT', json: input });
}

export async function deleteTicketDraft(id: number): Promise<void> {
  await apiFetch<void>(`/api/support/drafts/${id}`, { method: 'DELETE' });
}

export async function listTickets(): Promise<TicketSummary[]> {
  return apiFetch<TicketSummary[]>('/api/support/tickets');
}

export async function createTicket(input: { subject: string; message: string }): Promise<TicketDetail> {
  return apiFetch<TicketDetail>('/api/support/tickets', { method: 'POST', json: input });
}

export async function getTicket(id: number): Promise<TicketDetail> {
  return apiFetch<TicketDetail>(`/api/support/tickets/${id}`);
}

export async function updateTicketStatus(id: number, status: TicketStatus): Promise<TicketDetail> {
  return apiFetch<TicketDetail>(`/api/support/tickets/${id}/status`, { method: 'PATCH', json: { status } });
}

export async function addMessage(ticketId: number, body: string): Promise<TicketMessage> {
  return apiFetch<TicketMessage>(`/api/support/tickets/${ticketId}/messages`, { method: 'POST', json: { body } });
}

export async function editMessage(ticketId: number, messageId: number, body: string): Promise<TicketMessage> {
  return apiFetch<TicketMessage>(`/api/support/tickets/${ticketId}/messages/${messageId}`, {
    method: 'PATCH',
    json: { body },
  });
}

export async function deleteMessage(ticketId: number, messageId: number): Promise<void> {
  await apiFetch<void>(`/api/support/tickets/${ticketId}/messages/${messageId}`, { method: 'DELETE' });
}
