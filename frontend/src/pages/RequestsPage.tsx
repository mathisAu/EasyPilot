import { useMemo } from 'react';
import { Eye, FileCheck2, FileText, Search, Sparkles, SlidersHorizontal, X } from 'lucide-react';
import { Metric } from '../components/Metric';
import { StatusPill } from '../components/StatusPill';
import { stages, toneFor } from '../data';
import type { DocumentType, RequestStatus } from '../types';

interface RequestsPageProps {
  types: DocumentType[];
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: RequestStatus | null;
  onToggleStatusFilter: (label: RequestStatus) => void;
  onViewType: (type: DocumentType) => void;
}

function formatDate(value?: string): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('nl-NL');
}

export function RequestsPage({
  types,
  search,
  onSearchChange,
  statusFilter,
  onToggleStatusFilter,
  onViewType,
}: RequestsPageProps) {
  const filteredTypes = useMemo(
    () =>
      types
        .filter((type) =>
          `${type.organizationName ?? ''} ${type.provider} ${type.name}`.toLowerCase().includes(search.toLowerCase())
        )
        .filter((type) => !statusFilter || type.status === statusFilter),
    [types, search, statusFilter]
  );

  const inBehandeling = types.filter((type) =>
    (['In beoordeling', 'Inleren', 'Testen', 'Correctie nodig'] as RequestStatus[]).includes(type.status)
  ).length;
  const goedgekeurd = types.filter((type) => type.status === 'Goedgekeurd').length;
  const live = types.filter((type) => type.status === 'Live').length;

  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">Interne verwerking</p>
          <h1>Documentaanvragen</h1>
          <p className="page-description">Alle aangeleverde documenttypes op één plek.</p>
        </div>
      </section>

      <section className="metrics-grid" aria-label="Overzicht aanvragen">
        <Metric icon={FileText} label="Totaal aanvragen" value={types.length} note="Alle documenttypes" />
        <Metric icon={Search} label="In behandeling" value={inBehandeling} note="In beoordeling t/m correctie" tone="blue" />
        <Metric icon={Sparkles} label="Goedgekeurd" value={goedgekeurd} note="Klaar voor live" tone="amber" />
        <Metric icon={FileCheck2} label="Live bij klanten" value={live} note="Automatisch verwerkt" tone="green" />
      </section>

      <section className="process-band">
        <div className="section-title">
          <div>
            <p className="eyebrow">Workflow</p>
            <h2>Waar staan de aanvragen?</h2>
          </div>
          <span className="hint-text">Klik op een fase om te filteren</span>
        </div>
        <div className="stage-track">
          {stages.map((stage, index) => (
            <button
              className={`stage-wrap stage-button ${statusFilter === stage.label ? 'stage-active' : ''}`}
              key={stage.label}
              onClick={() => onToggleStatusFilter(stage.label)}
            >
              <div className={`stage-icon ${stage.tone}`}>
                <stage.icon size={17} />
              </div>
              <div className="stage-copy">
                <strong>{types.filter((type) => type.status === stage.label).length}</strong>
                <span>{stage.label}</span>
              </div>
              {index < stages.length - 1 && <div className="stage-line" />}
            </button>
          ))}
        </div>
      </section>

      <section className="table-section">
        <div className="section-title">
          <div>
            <p className="eyebrow">Overzicht aanvragen</p>
            <h2>Recente documentaanvragen</h2>
          </div>
          <button
            className={`filter-button ${statusFilter ? 'filter-button-active' : ''}`}
            onClick={() => onToggleStatusFilter('In beoordeling')}
          >
            <SlidersHorizontal size={16} /> Filter
          </button>
        </div>

        <div className="table-toolbar">
          <div className="search-field">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Zoek op klant, leverancier..."
            />
            {search && (
              <button onClick={() => onSearchChange('')} aria-label="Zoekopdracht wissen">
                <X size={15} />
              </button>
            )}
          </div>
          {statusFilter && (
            <button className="active-filter-chip" onClick={() => onToggleStatusFilter(statusFilter)}>
              {statusFilter} <X size={13} />
            </button>
          )}
          <span className="result-count">
            {filteredTypes.length} van {types.length} aanvragen
          </span>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Klant</th>
                <th>Opdrachtgever</th>
                <th>Documenttype</th>
                <th>Aangeleverd</th>
                <th>Status</th>
                <th aria-label="Acties" />
              </tr>
            </thead>
            <tbody>
              {filteredTypes.map((type) => (
                <tr key={type.id}>
                  <td>
                    <div className="customer-cell">
                      <span className="customer-logo">{type.provider.slice(0, 1)}</span>
                      <strong>{type.organizationName ?? '—'}</strong>
                    </div>
                  </td>
                  <td>{type.provider}</td>
                  <td>{type.name}</td>
                  <td>{formatDate(type.createdAt)}</td>
                  <td>
                    <StatusPill tone={toneFor(type.status)}>{type.status}</StatusPill>
                  </td>
                  <td>
                    <button
                      className="row-action"
                      onClick={() => onViewType(type)}
                      aria-label={`Bekijk ${type.name}`}
                      title="Bekijken"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTypes.length === 0 && (
            <div className="empty-state">
              <Search size={22} />
              <strong>Geen aanvragen gevonden</strong>
              <span>Probeer een andere zoekopdracht of filter.</span>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
