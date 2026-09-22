import { useMemo } from 'react';
import { ChevronRight, Eye, FileCheck2, FileText, Plus, Search, Sparkles, SlidersHorizontal, X } from 'lucide-react';
import { Metric } from '../components/Metric';
import { StatusPill } from '../components/StatusPill';
import { stages } from '../data';
import type { DocumentRequest, RequestStatus } from '../types';

interface RequestsPageProps {
  requests: DocumentRequest[];
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: RequestStatus | null;
  onToggleStatusFilter: (label: RequestStatus) => void;
  onAddRequest: () => void;
  onViewRequest: (request: DocumentRequest) => void;
}

export function RequestsPage({
  requests,
  search,
  onSearchChange,
  statusFilter,
  onToggleStatusFilter,
  onAddRequest,
  onViewRequest,
}: RequestsPageProps) {
  const filteredRequests = useMemo(
    () =>
      requests
        .filter((request) =>
          `${request.customer} ${request.provider} ${request.type}`.toLowerCase().includes(search.toLowerCase()),
        )
        .filter((request) => !statusFilter || request.status === statusFilter),
    [requests, search, statusFilter],
  );

  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">Interne verwerking</p>
          <h1>Documentaanvragen</h1>
          <p className="page-description">Alle aangeleverde documenttypes op één plek.</p>
        </div>
        <button className="primary-button" onClick={onAddRequest}>
          <Plus size={18} /> Nieuwe aanvraag
        </button>
      </section>

      <section className="metrics-grid" aria-label="Overzicht aanvragen">
        <Metric icon={FileText} label="Open aanvragen" value={requests.length + 8} note="+3 deze week" />
        <Metric icon={Search} label="In behandeling" value="6" note="50% van totaal" tone="blue" />
        <Metric icon={Sparkles} label="Actieve documenttypes" value="8" note="+2 deze maand" tone="amber" />
        <Metric icon={FileCheck2} label="Live bij klanten" value="4" note="100% uptime" tone="green" />
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
                <strong>{stage.value}</strong>
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
            {filteredRequests.length} van {requests.length} aanvragen
          </span>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Klant</th>
                <th>Leverancier</th>
                <th>Documenttype</th>
                <th>Aangeleverd</th>
                <th>Status</th>
                <th aria-label="Acties" />
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id}>
                  <td>
                    <div className="customer-cell">
                      <span className="customer-logo">{request.provider.slice(0, 1)}</span>
                      <strong>{request.customer}</strong>
                    </div>
                  </td>
                  <td>{request.provider}</td>
                  <td>{request.type}</td>
                  <td>{request.date}</td>
                  <td>
                    <StatusPill tone={request.tone}>{request.status}</StatusPill>
                  </td>
                  <td>
                    <button
                      className="row-action"
                      onClick={() => onViewRequest(request)}
                      aria-label={`Bekijk ${request.customer}`}
                      title="Bekijken"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRequests.length === 0 && (
            <div className="empty-state">
              <Search size={22} />
              <strong>Geen aanvragen gevonden</strong>
              <span>Probeer een andere zoekopdracht of filter.</span>
            </div>
          )}
        </div>
      </section>

      <section className="callout">
        <div className="callout-icon">
          <Sparkles size={21} />
        </div>
        <div>
          <strong>Maak documentverwerking slimmer</strong>
          <p>Lever voorbeelden aan, leer het documenttype in en laat EasyPilot de rest doen.</p>
        </div>
        <button className="secondary-button" onClick={onAddRequest}>
          Start een aanvraag <ChevronRight size={16} />
        </button>
      </section>
    </>
  );
}
