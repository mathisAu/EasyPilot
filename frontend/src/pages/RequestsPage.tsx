import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Eye, FileCheck2, FileText, Search, Sparkles, SlidersHorizontal, X } from 'lucide-react';
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

const NO_ORGANIZATION = 'Intern (geen klant)';

function formatDate(value?: string): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('nl-NL');
}

function groupByOrganization(types: DocumentType[]): [string, DocumentType[]][] {
  const groups = new Map<string, DocumentType[]>();
  for (const type of types) {
    const key = type.organizationName ?? NO_ORGANIZATION;
    groups.set(key, [...(groups.get(key) ?? []), type]);
  }
  return [...groups.entries()].sort(([a], [b]) => {
    if (a === NO_ORGANIZATION) return 1;
    if (b === NO_ORGANIZATION) return -1;
    return a.localeCompare(b, 'nl');
  });
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
  const groups = useMemo(() => groupByOrganization(filteredTypes), [filteredTypes]);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  function toggleGroup(name: string) {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

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
                <th>Documenttype</th>
                <th>Opdrachtgever</th>
                <th>Aangeleverd</th>
                <th>Status</th>
                <th aria-label="Acties" />
              </tr>
            </thead>
            {groups.map(([organizationName, groupTypes]) => {
              const isCollapsed = collapsed.has(organizationName);
              return (
                <tbody key={organizationName}>
                  <tr className="group-row">
                    <td colSpan={5}>
                      <button
                        type="button"
                        className="group-toggle"
                        onClick={() => toggleGroup(organizationName)}
                        aria-expanded={!isCollapsed}
                      >
                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                        <span className="customer-logo">{organizationName.slice(0, 1).toUpperCase()}</span>
                        <strong>{organizationName}</strong>
                        <span className="group-count">
                          {groupTypes.length} {groupTypes.length === 1 ? 'aanvraag' : 'aanvragen'}
                        </span>
                      </button>
                    </td>
                  </tr>
                  {!isCollapsed &&
                    groupTypes.map((type) => (
                      <tr key={type.id}>
                        <td>
                          <strong className="type-name">{type.name}</strong>
                        </td>
                        <td>{type.provider}</td>
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
              );
            })}
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
