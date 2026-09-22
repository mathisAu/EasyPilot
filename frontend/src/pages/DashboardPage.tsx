import { ChevronRight, FileCheck2, FileText, Plus, Search, Sparkles } from 'lucide-react';
import { Metric } from '../components/Metric';
import type { DocumentType, PageKey } from '../types';

interface ActivityRowProps {
  label: string;
  detail: string;
}

function ActivityRow({ label, detail }: ActivityRowProps) {
  return (
    <div className="activity-row">
      <span className="activity-dot" />
      <div>
        <strong>{label}</strong>
        <small>{detail}</small>
      </div>
      <ChevronRight size={16} />
    </div>
  );
}

interface DashboardPageProps {
  types: DocumentType[];
  onAddType: () => void;
  onNavigate: (page: PageKey) => void;
}

export function DashboardPage({ types, onAddType, onNavigate }: DashboardPageProps) {
  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">Welkom terug, Marijn</p>
          <h1>Goedemorgen</h1>
          <p className="page-description">Dit is de voortgang van je documentverwerking.</p>
        </div>
        <button className="primary-button" onClick={onAddType}>
          <Plus size={18} /> Nieuw documenttype
        </button>
      </section>

      <section className="metrics-grid" aria-label="Overzicht aanvragen">
        <Metric icon={FileText} label="Open aanvragen" value={types.length + 8} note="+3 deze week" />
        <Metric icon={Search} label="In behandeling" value="6" note="50% van totaal" tone="blue" />
        <Metric icon={Sparkles} label="Actieve documenttypes" value="8" note="+2 deze maand" tone="amber" />
        <Metric icon={FileCheck2} label="Live bij klanten" value="4" note="100% uptime" tone="green" />
      </section>

      <section className="dashboard-grid">
        <div className="quick-panel">
          <div className="section-title">
            <div>
              <p className="eyebrow">Snel starten</p>
              <h2>Wat wil je doen?</h2>
            </div>
          </div>
          <button className="quick-action" onClick={onAddType}>
            <span className="quick-action-icon blue">
              <Plus size={19} />
            </span>
            <span>
              <strong>Nieuw documenttype aanleveren</strong>
              <small>Leer EasyPilot een nieuw document</small>
            </span>
            <ChevronRight size={17} />
          </button>
          <button className="quick-action" onClick={() => onNavigate('Documentaanvragen')}>
            <span className="quick-action-icon green">
              <FileText size={19} />
            </span>
            <span>
              <strong>Aanvragen beoordelen</strong>
              <small>Bekijk wat er aandacht nodig heeft</small>
            </span>
            <ChevronRight size={17} />
          </button>
        </div>

        <div className="activity-panel">
          <div className="section-title">
            <div>
              <p className="eyebrow">Activiteit</p>
              <h2>Laatste updates</h2>
            </div>
          </div>
          <ActivityRow label="Nieuwe voorbeelden ontvangen" detail="Zeelte Transport · 12 minuten geleden" />
          <ActivityRow label="DHL is klaar om te testen" detail="Transportopdracht · Vandaag" />
          <ActivityRow label="Documenttype live gezet" detail="BMN · Gisteren" />
        </div>
      </section>
    </>
  );
}
