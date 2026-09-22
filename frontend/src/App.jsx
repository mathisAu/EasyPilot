import { useState } from 'react';
import {
  Bell,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  FileCheck2,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
} from 'lucide-react';

const requests = [
  { customer: 'Zeelte Transport', type: 'Transportopdracht', provider: 'BMN', date: '14-09-2026', status: 'In beoordeling', tone: 'blue' },
  { customer: 'Van Dijk Logistics', type: 'Transportopdracht', provider: 'DHL', date: '13-09-2026', status: 'Inleren', tone: 'amber' },
  { customer: 'Koster Transport', type: 'Laadlijst', provider: 'Vos', date: '12-09-2026', status: 'Testen', tone: 'violet' },
  { customer: 'Jansen Transport', type: 'Transportopdracht', provider: 'XPO', date: '10-09-2026', status: 'Aangeleverd', tone: 'slate' },
];

const stages = [
  { label: 'Aangeleverd', value: '3', icon: FileText, tone: 'sky' },
  { label: 'In beoordeling', value: '2', icon: Search, tone: 'blue' },
  { label: 'Inleren', value: '2', icon: Sparkles, tone: 'violet' },
  { label: 'Testen', value: '2', icon: SlidersHorizontal, tone: 'amber' },
  { label: 'Correctie', value: '1', icon: FileCheck2, tone: 'orange' },
  { label: 'Goedgekeurd', value: '4', icon: FileCheck2, tone: 'emerald' },
  { label: 'Live', value: '8', icon: Sparkles, tone: 'blue' },
];

function StatusPill({ tone, children }) {
  return <span className={`status-pill status-${tone}`}><span className="status-dot" />{children}</span>;
}

function App() {
  const [active, setActive] = useState('Documentaanvragen');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const filteredRequests = requests.filter((request) =>
    `${request.customer} ${request.provider} ${request.type}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-lockup"><span className="brand-mark">➤</span><span>Easy<span>Pilot</span></span></div>
        <div className="workspace-switcher"><div className="workspace-avatar">ET</div><div><strong>EasyPilot team</strong><small>Administratie</small></div><ChevronDown size={16} /></div>
        <nav className="primary-nav" aria-label="Hoofdnavigatie">
          {[['Dashboard', LayoutDashboard], ['Documentaanvragen', FileText], ['Documenttypes', FileCheck2], ['Organisaties', Users]].map(([label, Icon]) => (
            <button className={active === label ? 'nav-item active' : 'nav-item'} key={label} onClick={() => { setActive(label); setMobileOpen(false); }}><Icon size={18} /><span>{label}</span>{label === 'Documentaanvragen' && <span className="nav-count">12</span>}</button>
          ))}
        </nav>
        <div className="nav-divider" />
        <nav className="secondary-nav" aria-label="Instellingen">
          <button className="nav-item"><Settings size={18} /><span>Instellingen</span></button>
          <button className="nav-item"><CircleHelp size={18} /><span>Help & support</span></button>
        </nav>
        <div className="sidebar-footer"><div className="avatar">MV</div><div><strong>Marijn van Dijk</strong><small>Beheerder</small></div><ChevronDown size={15} /></div>
      </aside>

      <main className="main-content">
        <header className="topbar"><button className="icon-button menu-button" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu"><Menu size={21} /></button><div className="breadcrumb"><span>Werkruimte</span><ChevronRight size={14} /><strong>{active}</strong></div><div className="topbar-actions"><button className="icon-button" aria-label="Meldingen"><Bell size={19} /><span className="notification-dot" /></button><div className="topbar-avatar">MV</div></div></header>
        <div className="page-wrap">
          <section className="page-heading"><div><p className="eyebrow">Interne verwerking</p><h1>Documentaanvragen</h1><p className="page-description">Alle aangeleverde documenttypes op één plek.</p></div><button className="primary-button" onClick={() => setShowForm(true)}><Plus size={18} /> Nieuwe aanvraag</button></section>

          <section className="metrics-grid" aria-label="Overzicht aanvragen">
            <div className="metric-card metric-highlight"><div className="metric-icon"><FileText size={19} /></div><div><span>Open aanvragen</span><strong>12</strong></div><small>+3 deze week</small></div>
            <div className="metric-card"><div className="metric-icon blue"><Search size={19} /></div><div><span>In behandeling</span><strong>6</strong></div><small>50% van totaal</small></div>
            <div className="metric-card"><div className="metric-icon amber"><Sparkles size={19} /></div><div><span>Actieve documenttypes</span><strong>8</strong></div><small>+2 deze maand</small></div>
            <div className="metric-card"><div className="metric-icon green"><FileCheck2 size={19} /></div><div><span>Live bij klanten</span><strong>4</strong></div><small>100% uptime</small></div>
          </section>

          <section className="process-band"><div className="section-title"><div><p className="eyebrow">Workflow</p><h2>Waar staan de aanvragen?</h2></div><button className="text-button">Bekijk details <ChevronRight size={16} /></button></div><div className="stage-track">{stages.map((stage, index) => <div className="stage-wrap" key={stage.label}><div className={`stage-icon ${stage.tone}`}><stage.icon size={17} /></div><div className="stage-copy"><strong>{stage.value}</strong><span>{stage.label}</span></div>{index < stages.length - 1 && <div className="stage-line" />}</div>)}</div></section>

          <section className="table-section"><div className="section-title"><div><p className="eyebrow">Overzicht aanvragen</p><h2>Recente documentaanvragen</h2></div><button className="filter-button"><SlidersHorizontal size={16} /> Filter</button></div><div className="table-toolbar"><div className="search-field"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Zoek op klant, leverancier..." />{search && <button onClick={() => setSearch('')} aria-label="Zoekopdracht wissen"><X size={15} /></button>}</div><span className="result-count">{filteredRequests.length} van 12 aanvragen</span></div><div className="table-scroll"><table><thead><tr><th>Klant</th><th>Leverancier</th><th>Documenttype</th><th>Aangeleverd</th><th>Status</th><th aria-label="Acties" /></tr></thead><tbody>{filteredRequests.map((request) => <tr key={`${request.customer}-${request.provider}`}><td><div className="customer-cell"><span className="customer-logo">{request.provider.slice(0, 1)}</span><strong>{request.customer}</strong></div></td><td>{request.provider}</td><td>{request.type}</td><td>{request.date}</td><td><StatusPill tone={request.tone}>{request.status}</StatusPill></td><td><button className="row-action" aria-label={`Bekijk ${request.customer}`}><ChevronRight size={17} /></button></td></tr>)}</tbody></table></div></section>

          <section className="callout"><div className="callout-icon"><Sparkles size={21} /></div><div><strong>Maak documentverwerking slimmer</strong><p>Lever voorbeelden aan, leer het documenttype in en laat EasyPilot de rest doen.</p></div><button className="secondary-button" onClick={() => setShowForm(true)}>Start een aanvraag <ChevronRight size={16} /></button></section>
        </div>
      </main>

      {showForm && <div className="modal-backdrop" onClick={() => setShowForm(false)}><div className="modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setShowForm(false)} aria-label="Sluiten"><X size={18} /></button><p className="eyebrow">Nieuwe workflow</p><h2>Documenttype aanleveren</h2><p className="modal-description">Begin met de basisgegevens van het document dat je wilt leren.</p><label>Opdrachtgever<input placeholder="Bijv. BMN" /></label><label>Documenttype<select defaultValue=""><option value="" disabled>Kies een documenttype</option><option>Transportopdracht</option><option>Laadlijst</option></select></label><div className="modal-actions"><button className="secondary-button" onClick={() => setShowForm(false)}>Annuleren</button><button className="primary-button" onClick={() => setShowForm(false)}>Volgende <ChevronRight size={16} /></button></div></div></div>}
    </div>
  );
}

export default App;
