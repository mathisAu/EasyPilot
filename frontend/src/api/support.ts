import { apiFetch } from './client';
import type { TicketDetail, TicketMessage, TicketStatus, TicketSummary } from '../types';

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
