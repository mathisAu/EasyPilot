import { CircleHelp, FileText, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ClientPageKey } from './types';

const navItems: [ClientPageKey, LucideIcon][] = [
  ['Documenten', FileText],
  ['Mijn organisatie', Users],
  ['Hulp', CircleHelp],
];

interface ClientSidebarProps {
  active: ClientPageKey;
  mobileOpen: boolean;
  organizationName: string;
  onNavigate: (page: ClientPageKey) => void;
}

export function ClientSidebar({ active, mobileOpen, organizationName, onNavigate }: ClientSidebarProps) {
  return (
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <div className="brand-lockup">
        <span className="brand-mark">➤</span>
        <span>
          Easy<span>Pilot</span>
        </span>
      </div>

      <div className="workspace-switcher">
        <div className="workspace-avatar">{organizationName.slice(0, 2).toUpperCase()}</div>
        <div>
          <strong>{organizationName}</strong>
          <small>Klantportaal</small>
        </div>
      </div>

      <nav className="primary-nav" aria-label="Hoofdnavigatie">
        {navItems.map(([label, Icon]) => (
          <button
            key={label}
            className={active === label ? 'nav-item active' : 'nav-item'}
            onClick={() => onNavigate(label)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
