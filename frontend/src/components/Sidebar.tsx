import { ChevronDown, CircleHelp, FileCheck2, FileText, LayoutDashboard, Settings, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { PageKey } from '../types';

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

export function Sidebar({ active, mobileOpen, requestCount, onNavigate }: SidebarProps) {
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
        <button className="nav-item" type="button">
          <Settings size={18} />
          <span>Instellingen</span>
        </button>
        <button className="nav-item" type="button">
          <CircleHelp size={18} />
          <span>Help &amp; support</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="avatar">MV</div>
        <div>
          <strong>Marijn van Dijk</strong>
          <small>Beheerder</small>
        </div>
        <ChevronDown size={15} />
      </div>
    </aside>
  );
}
