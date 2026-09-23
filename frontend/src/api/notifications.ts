import { apiFetch } from './client';
import type { AppNotification } from '../types';

export async function listNotifications(): Promise<AppNotification[]> {
  return apiFetch<AppNotification[]>('/api/notifications');
}

export async function getUnreadCount(): Promise<number> {
  const result = await apiFetch<{ count: number }>('/api/notifications/unread-count');
  return result.count;
}

export async function markNotificationRead(id: number): Promise<AppNotification> {
  return apiFetch<AppNotification>(`/api/notifications/${id}/read`, { method: 'POST' });
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiFetch<void>('/api/notifications/read-all', { method: 'POST' });
}
