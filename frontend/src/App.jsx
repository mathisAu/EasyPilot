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

const initialRequests = [
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

const navItems = [
  ['Dashboard', LayoutDashboard],
  ['Documentaanvragen', FileText],
  ['Documenttypes', FileCheck2],
  ['Organisaties', Users],
];

const documentTypes = [
  { name: 'Transportopdracht', provider: 'BMN', examples: 7, live: true, fields: 12 },
  { name: 'Transportopdracht', provider: 'DHL', examples: 5, live: true, fields: 10 },
  { name: 'Laadlijst', provider: 'Vos', examples: 6, live: false, fields: 8 },
  { name: 'Transportopdracht', provider: 'XPO', examples: 3, live: false, fields: 12 },
];

function App() {
  const [active, setActive] = useState('Documentaanvragen');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [requests, setRequests] = useState(initialRequests);
  const [toast, setToast] = useState('');
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({ customer: '', type: '', provider: '', files: 0 });
  const filteredRequests = requests.filter((request) =>
    `${request.customer} ${request.provider} ${request.type}`.toLowerCase().includes(search.toLowerCase()),
  );
  const openForm = () => { setFormStep(1); setFormData({ customer: '', type: '', provider: '', files: 0 }); setShowForm(true); };
  const closeForm = () => setShowForm(false);
  const updateForm = (key, value) => setFormData((current) => ({ ...current, [key]: value }));
  const saveRequest = (event) => {
    event.preventDefault();
    const newRequest = { customer: formData.customer, type: formData.type, provider: formData.provider, date: 'Vandaag', status: 'Aangeleverd', tone: 'slate' };
    setRequests((current) => [newRequest, ...current]);
    closeForm();
    setActive('Documentaanvragen');
    setToast('Nieuwe documentaanvraag toegevoegd');
    window.setTimeout(() => setToast(''), 2800);
  };

  const showView = () => {
    if (active === 'Dashboard') {
      return <>
        <section className="page-heading"><div><p className="eyebrow">Welkom terug, Marijn</p><h1>Goedemorgen</h1><p className="page-description">Dit is de voortgang van je documentverwerking.</p></div><button className="primary-button" onClick={openForm}><Plus size={18} /> Nieuwe aanvraag</button></section>
        <section className="metrics-grid" aria-label="Overzicht aanvragen"><Metric icon={FileText} label="Open aanvragen" value={requests.length + 8} note="+3 deze week" /><Metric icon={Search} label="In behandeling" value="6" note="50% van totaal" tone="blue" /><Metric icon={Sparkles} label="Actieve documenttypes" value="8" note="+2 deze maand" tone="amber" /><Metric icon={FileCheck2} label="Live bij klanten" value="4" note="100% uptime" tone="green" /></section>
        <section className="dashboard-grid"><div className="quick-panel"><div className="section-title"><div><p className="eyebrow">Snel starten</p><h2>Wat wil je doen?</h2></div></div><button className="quick-action" onClick={openForm}><span className="quick-action-icon blue"><Plus size={19} /></span><span><strong>Nieuw documenttype aanleveren</strong><small>Leer EasyPilot een nieuw document</small></span><ChevronRight size={17} /></button><button className="quick-action" onClick={() => setActive('Documentaanvragen')}><span className="quick-action-icon green"><FileText size={19} /></span><span><strong>Aanvragen beoordelen</strong><small>Bekijk wat er aandacht nodig heeft</small></span><ChevronRight size={17} /></button></div><div className="activity-panel"><div className="section-title"><div><p className="eyebrow">Activiteit</p><h2>Laatste updates</h2></div></div><Activity label="Nieuwe voorbeelden ontvangen" detail="Zeelte Transport · 12 minuten geleden" /><Activity label="DHL is klaar om te testen" detail="Transportopdracht · Vandaag" /><Activity label="Documenttype live gezet" detail="BMN · Gisteren" /></div></section>
      </>;
    }
    if (active === 'Documenttypes') return <DocumentTypes onAdd={openForm} />;
    if (active === 'Organisaties') return <Organizations onAdd={() => { setToast('Organisatie toevoegen komt in de volgende stap'); window.setTimeout(() => setToast(''), 2800); }} />;
    return <>
      <section className="page-heading"><div><p className="eyebrow">Interne verwerking</p><h1>Documentaanvragen</h1><p className="page-description">Alle aangeleverde documenttypes op één plek.</p></div><button className="primary-button" onClick={openForm}><Plus size={18} /> Nieuwe aanvraag</button></section>
      <section className="metrics-grid" aria-label="Overzicht aanvragen"><Metric icon={FileText} label="Open aanvragen" value={requests.length + 8} note="+3 deze week" /><Metric icon={Search} label="In behandeling" value="6" note="50% van totaal" tone="blue" /><Metric icon={Sparkles} label="Actieve documenttypes" value="8" note="+2 deze maand" tone="amber" /><Metric icon={FileCheck2} label="Live bij klanten" value="4" note="100% uptime" tone="green" /></section>
      <section className="process-band"><div className="section-title"><div><p className="eyebrow">Workflow</p><h2>Waar staan de aanvragen?</h2></div><button className="text-button" onClick={() => setToast('Workflowdetails zijn zichtbaar in de aanvragenlijst')}>Bekijk details <ChevronRight size={16} /></button></div><div className="stage-track">{stages.map((stage, index) => <button className="stage-wrap stage-button" key={stage.label} onClick={() => setSearch(stage.label === 'Aangeleverd' ? 'XPO' : '')}><div className={`stage-icon ${stage.tone}`}><stage.icon size={17} /></div><div className="stage-copy"><strong>{stage.value}</strong><span>{stage.label}</span></div>{index < stages.length - 1 && <div className="stage-line" />}</button>)}</div></section>
      <section className="table-section"><div className="section-title"><div><p className="eyebrow">Overzicht aanvragen</p><h2>Recente documentaanvragen</h2></div><button className="filter-button" onClick={() => setSearch('In beoordeling')}><SlidersHorizontal size={16} /> Filter</button></div><div className="table-toolbar"><div className="search-field"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Zoek op klant, leverancier..." />{search && <button onClick={() => setSearch('')} aria-label="Zoekopdracht wissen"><X size={15} /></button>}</div><span className="result-count">{filteredRequests.length} van {requests.length} aanvragen</span></div><div className="table-scroll"><table><thead><tr><th>Klant</th><th>Leverancier</th><th>Documenttype</th><th>Aangeleverd</th><th>Status</th><th aria-label="Acties" /></tr></thead><tbody>{filteredRequests.map((request) => <tr key={`${request.customer}-${request.provider}-${request.date}`}><td><div className="customer-cell"><span className="customer-logo">{request.provider.slice(0, 1)}</span><strong>{request.customer}</strong></div></td><td>{request.provider}</td><td>{request.type}</td><td>{request.date}</td><td><StatusPill tone={request.tone}>{request.status}</StatusPill></td><td><button className="row-action" onClick={() => setToast(`${request.customer} geselecteerd`)} aria-label={`Bekijk ${request.customer}`}><ChevronRight size={17} /></button></td></tr>)}</tbody></table>{filteredRequests.length === 0 && <div className="empty-state"><Search size={22} /><strong>Geen aanvragen gevonden</strong><span>Probeer een andere zoekopdracht.</span></div>}</div></section>
      <section className="callout"><div className="callout-icon"><Sparkles size={21} /></div><div><strong>Maak documentverwerking slimmer</strong><p>Lever voorbeelden aan, leer het documenttype in en laat EasyPilot de rest doen.</p></div><button className="secondary-button" onClick={openForm}>Start een aanvraag <ChevronRight size={16} /></button></section>
    </>;
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-lockup"><span className="brand-mark">➤</span><span>Easy<span>Pilot</span></span></div>
        <div className="workspace-switcher"><div className="workspace-avatar">ET</div><div><strong>EasyPilot team</strong><small>Administratie</small></div><ChevronDown size={16} /></div>
        <nav className="primary-nav" aria-label="Hoofdnavigatie">
          {navItems.map(([label, Icon]) => (
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
          {showView()}
        </div>
      </main>

      {showForm && <RequestModal formStep={formStep} setFormStep={setFormStep} formData={formData} updateForm={updateForm} onClose={closeForm} onSubmit={saveRequest} />}
      {toast && <div className="toast"><FileCheck2 size={17} />{toast}</div>}
    </div>
  );
}

function Metric({ icon: Icon, label, value, note, tone = '' }) { return <div className={`metric-card ${tone ? '' : 'metric-highlight'}`}><div className={`metric-icon ${tone}`}><Icon size={19} /></div><div><span>{label}</span><strong>{value}</strong></div><small>{note}</small></div>; }
function Activity({ label, detail }) { return <div className="activity-row"><span className="activity-dot" /><div><strong>{label}</strong><small>{detail}</small></div><ChevronRight size={16} /></div>; }
function DocumentTypes({ onAdd }) { return <><section className="page-heading"><div><p className="eyebrow">Configuratie</p><h1>Documenttypes</h1><p className="page-description">Leer, test en beheer de documenttypes van je klanten.</p></div><button className="primary-button" onClick={onAdd}><Plus size={18} /> Nieuw documenttype</button></section><section className="type-grid">{documentTypes.map((item) => <article className="type-card" key={`${item.provider}-${item.name}`}><div className="type-card-top"><span className="customer-logo">{item.provider[0]}</span><StatusPill tone={item.live ? 'green' : 'amber'}>{item.live ? 'Live' : 'Inleren'}</StatusPill></div><h2>{item.name}</h2><p>{item.provider}</p><div className="type-stats"><span><strong>{item.examples}</strong> voorbeelden</span><span><strong>{item.fields}</strong> velden</span></div><button className="text-button">Openen <ChevronRight size={16} /></button></article>)}</section></>; }
function Organizations({ onAdd }) { return <><section className="page-heading"><div><p className="eyebrow">Werkruimte</p><h1>Organisaties</h1><p className="page-description">Klanten en hun actieve documentverwerking.</p></div><button className="primary-button" onClick={onAdd}><Plus size={18} /> Organisatie toevoegen</button></section><section className="organization-list">{['Zeelte Transport', 'Van Dijk Logistics', 'Koster Transport', 'Jansen Transport'].map((name, index) => <div className="organization-row" key={name}><span className="organization-avatar">{name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><div><strong>{name}</strong><small>{index + 1} actieve documenttypes · Laatste activiteit vandaag</small></div><StatusPill tone="green">Actief</StatusPill><ChevronRight size={17} /></div>)}</section></>; }

function RequestModal({ formStep, setFormStep, formData, updateForm, onClose, onSubmit }) { const canContinue = formStep === 1 ? formData.customer && formData.type && formData.provider : formData.files > 0; return <div className="modal-backdrop" onClick={onClose}><form className="modal request-modal" onClick={(event) => event.stopPropagation()} onSubmit={onSubmit}><button type="button" className="modal-close" onClick={onClose} aria-label="Sluiten"><X size={18} /></button><p className="eyebrow">Nieuwe workflow · stap {formStep} van 2</p><div className="stepper"><span className={formStep === 1 ? 'active' : 'done'}>1 Basisgegevens</span><span className={formStep === 2 ? 'active' : ''}>2 Voorbeelden</span></div>{formStep === 1 ? <><h2>Nieuw documenttype aanleveren</h2><p className="modal-description">Begin met de gegevens van het document dat EasyPilot moet leren.</p><label>Opdrachtgever<input value={formData.customer} onChange={(event) => updateForm('customer', event.target.value)} placeholder="Bijv. Zeelte Transport" autoFocus /></label><label>Leverancier<input value={formData.provider} onChange={(event) => updateForm('provider', event.target.value)} placeholder="Bijv. BMN" /></label><label>Documenttype<select value={formData.type} onChange={(event) => updateForm('type', event.target.value)}><option value="">Kies een documenttype</option><option>Transportopdracht</option><option>Laadlijst</option></select></label></> : <><h2>Voorbeelden toevoegen</h2><p className="modal-description">Voeg minimaal één voorbeeld toe. Je kunt dit nu simuleren voor de demo.</p><button type="button" className={`upload-zone ${formData.files ? 'uploaded' : ''}`} onClick={() => updateForm('files', formData.files + 1)}><FileText size={24} /><strong>{formData.files ? `${formData.files} voorbeeld${formData.files === 1 ? '' : 'en'} toegevoegd` : 'Klik om voorbeelden toe te voegen'}</strong><small>PDF, JPG of PNG</small></button></>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={formStep === 1 ? onClose : () => setFormStep(1)}>{formStep === 1 ? 'Annuleren' : 'Vorige'}</button>{formStep === 1 ? <button type="button" className="primary-button" disabled={!canContinue} onClick={() => setFormStep(2)}>Volgende <ChevronRight size={16} /></button> : <button type="submit" className="primary-button" disabled={!canContinue}>Aanvraag aanmaken <FileCheck2 size={16} /></button>}</div></form></div>; }

export default App;
