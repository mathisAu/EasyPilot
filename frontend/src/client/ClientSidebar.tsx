import { ChevronDown, CircleHelp, FileText, Settings, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ClientPageKey } from './types';
import { useAuth } from '../auth/AuthContext';

const navItems: [ClientPageKey, LucideIcon][] = [
  ['Documenten', FileText],
  ['Mijn organisatie', Users],
];

interface ClientSidebarProps {
  active: ClientPageKey;
  mobileOpen: boolean;
  organizationName: string;
  onNavigate: (page: ClientPageKey) => void;
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

export function ClientSidebar({ active, mobileOpen, organizationName, onNavigate }: ClientSidebarProps) {
  const { user } = useAuth();
  const displayName = user?.displayName?.trim() || user?.username || 'Gebruiker';

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

      <div className="nav-divider" />

      <nav className="secondary-nav" aria-label="Instellingen">
        <button
          className={active === 'Instellingen' ? 'nav-item active' : 'nav-item'}
          type="button"
          onClick={() => onNavigate('Instellingen')}
        >
          <Settings size={18} />
          <span>Instellingen</span>
        </button>
        <button
          className={active === 'Hulp' ? 'nav-item active' : 'nav-item'}
          type="button"
          onClick={() => onNavigate('Hulp')}
        >
          <CircleHelp size={18} />
          <span>Hulp</span>
        </button>
      </nav>

      <button className="sidebar-footer" type="button" onClick={() => onNavigate('Instellingen')}>
        <div className="avatar">{initials(displayName)}</div>
        <div>
          <strong>{displayName}</strong>
          <small>Klant</small>
        </div>
        <ChevronDown size={15} />
      </button>
    </aside>
  );
}
