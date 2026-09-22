import { Bell, ChevronRight, Menu } from 'lucide-react';
import type { PageKey } from '../types';

interface TopbarProps {
  active: PageKey;
  onToggleMobileNav: () => void;
}

export function Topbar({ active, onToggleMobileNav }: TopbarProps) {
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
        <button className="icon-button" aria-label="Meldingen">
          <Bell size={19} />
          <span className="notification-dot" />
        </button>
        <div className="topbar-avatar">MV</div>
      </div>
    </header>
  );
}
