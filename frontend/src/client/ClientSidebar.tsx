import { CircleHelp, FileText, Settings, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ClientPageKey } from './types';
import { AccountSwitcherMenu } from '../components/AccountSwitcherMenu';

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

      <AccountSwitcherMenu onOpenSettings={() => onNavigate('Instellingen')} />
    </aside>
  );
}
