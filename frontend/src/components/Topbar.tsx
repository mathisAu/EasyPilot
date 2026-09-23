import { ChevronRight, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { NotificationBell } from './NotificationBell';
import type { NotificationTargetType } from '../types';

interface TopbarProps {
  active: string;
  onToggleMobileNav: () => void;
  onLogout?: () => void;
  onNotificationNavigate?: (targetType: NotificationTargetType, targetId: number) => void;
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function Topbar({ active, onToggleMobileNav, onLogout, onNotificationNavigate }: TopbarProps) {
  const { user } = useAuth();
  const displayName = user?.displayName?.trim() || user?.username || 'Gebruiker';

  return (
    <header className="topbar">
      <button className="icon-button menu-button" onClick={onToggleMobileNav} aria-label="Menu">
        <Menu size={21} />
      </button>
      <div className="breadcrumb">
        <span>Werkruimte</span>
        <ChevronRight size={14} />
        <strong>{active}</strong>
      </div>
      <div className="topbar-actions">
        {onNotificationNavigate && <NotificationBell onNavigate={onNotificationNavigate} />}
        {onLogout && (
          <button className="icon-button" aria-label="Uitloggen" title="Uitloggen" onClick={onLogout}>
            <LogOut size={18} />
          </button>
        )}
        <div className="topbar-avatar">{initials(displayName)}</div>
      </div>
    </header>
  );
}
