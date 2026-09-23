import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import {
  getUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notifications';
import type { AppNotification, NotificationTargetType } from '../types';

const POLL_INTERVAL_MS = 30000;

interface NotificationBellProps {
  onNavigate: (targetType: NotificationTargetType, targetId: number) => void;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'zojuist';
  if (minutes < 60) return `${minutes} min geleden`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} uur geleden`;
  const days = Math.floor(hours / 24);
  return `${days} dag${days === 1 ? '' : 'en'} geleden`;
}

export function NotificationBell({ onNavigate }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  function refreshCount() {
    getUnreadCount().then(setUnreadCount).catch(() => undefined);
  }

  useEffect(() => {
    refreshCount();
    const timer = window.setInterval(refreshCount, POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  function toggleOpen() {
    setOpen((current) => {
      const next = !current;
      if (next && !loaded) {
        listNotifications()
          .then((items) => {
            setNotifications(items);
            setLoaded(true);
          })
          .catch(() => undefined);
      }
      return next;
    });
  }

  async function handleNotificationClick(notification: AppNotification) {
    setOpen(false);
    if (!notification.read) {
      setNotifications((current) =>
        current.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
      );
      setUnreadCount((count) => Math.max(0, count - 1));
      try {
        await markNotificationRead(notification.id);
      } catch {
        // best-effort; UI already reflects read state
      }
    }
    onNavigate(notification.targetType, notification.targetId);
  }

  async function handleMarkAllRead() {
    setNotifications((current) => current.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead();
    } catch {
      // best-effort
    }
  }

  return (
    <div className="notification-bell" ref={containerRef}>
      <button className="icon-button" aria-label="Meldingen" onClick={toggleOpen}>
        <Bell size={19} />
        {unreadCount > 0 && <span className="notification-dot" />}
      </button>

      {open && (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <strong>Meldingen</strong>
            {notifications.some((n) => !n.read) && (
              <button type="button" className="text-button" onClick={handleMarkAllRead}>
                <CheckCheck size={13} /> Alles gelezen
              </button>
            )}
          </div>

          {loaded && notifications.length === 0 && (
            <p className="notification-empty">Geen meldingen.</p>
          )}

          <div className="notification-list">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                className={`notification-item ${notification.read ? '' : 'unread'}`}
                onClick={() => handleNotificationClick(notification)}
              >
                {!notification.read && <span className="notification-item-dot" />}
                <div>
                  <strong>{notification.title}</strong>
                  <p>{notification.body}</p>
                  <small>{timeAgo(notification.createdAt)}</small>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
