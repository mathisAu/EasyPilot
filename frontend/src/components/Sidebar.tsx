import { ChevronDown, CircleHelp, FileCheck2, FileText, LayoutDashboard, Settings, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { PageKey } from '../types';
import { useAuth } from '../auth/AuthContext';

const navItems: [PageKey, LucideIcon][] = [
  ['Dashboard', LayoutDashboard],
  ['Documentaanvragen', FileText],
  ['Documenttypes', FileCheck2],
  ['Organisaties', Users],
];

interface SidebarProps {
  active: PageKey;
  mobileOpen: boolean;
  requestCount: number;
  onNavigate: (page: PageKey) => void;
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

export function Sidebar({ active, mobileOpen, requestCount, onNavigate }: SidebarProps) {
  const { user } = useAuth();
  const displayName = user?.displayName?.trim() || user?.username || 'Gebruiker';
  const roleLabel = user?.role === 'ADMIN' ? 'Beheerder' : 'Klant';

  return (
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <div className="brand-lockup">
        <span className="brand-mark">➤</span>
        <span>
          Easy<span>Pilot</span>
        </span>
      </div>

      <div className="workspace-switcher">
        <div className="workspace-avatar">ET</div>
        <div>
          <strong>EasyPilot team</strong>
          <small>Administratie</small>
        </div>
        <ChevronDown size={16} />
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
            {label === 'Documentaanvragen' && <span className="nav-count">{requestCount}</span>}
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
          className={active === 'Help & support' ? 'nav-item active' : 'nav-item'}
          type="button"
          onClick={() => onNavigate('Help & support')}
        >
          <CircleHelp size={18} />
          <span>Help &amp; support</span>
        </button>
      </nav>

      <button className="sidebar-footer" type="button" onClick={() => onNavigate('Instellingen')}>
        <div className="avatar">{initials(displayName)}</div>
        <div>
          <strong>{displayName}</strong>
          <small>{roleLabel}</small>
        </div>
        <ChevronDown size={15} />
      </button>
    </aside>
  );
}
