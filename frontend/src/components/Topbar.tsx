import { Bell, ChevronRight, LogOut, Menu } from 'lucide-react';

interface TopbarProps {
  active: string;
  onToggleMobileNav: () => void;
  onLogout?: () => void;
}

export function Topbar({ active, onToggleMobileNav, onLogout }: TopbarProps) {
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
        {onLogout && (
          <button className="icon-button" aria-label="Uitloggen" title="Uitloggen" onClick={onLogout}>
            <LogOut size={18} />
          </button>
        )}
        <div className="topbar-avatar">MV</div>
      </div>
    </header>
  );
}
