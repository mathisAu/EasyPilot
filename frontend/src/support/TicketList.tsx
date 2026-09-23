import { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronRight, FileClock, MessageSquare, Plus, Ticket } from 'lucide-react';
import type { TicketDraft, TicketSummary } from '../types';

interface TicketListProps {
  tickets: TicketSummary[];
  drafts?: TicketDraft[];
  loading: boolean;
  showOrganization?: boolean;
  onOpen: (ticket: TicketSummary) => void;
  onOpenDraft?: (draft: TicketDraft) => void;
  onCreate: () => void;
}

function draftPreview(draft: TicketDraft): string {
  const text = (draft.body ?? '').replace(/\s+/g, ' ').trim();
  if (!text) return 'Nog geen bericht';
  return text.length > 80 ? `${text.slice(0, 77)}...` : text;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'zojuist';
  if (minutes < 60) return `${minutes} min geleden`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} uur geleden`;
  const days = Math.floor(hours / 24);
  return `${days} dag${days === 1 ? '' : 'en'} geleden`;
}

export function TicketList({
  tickets,
  drafts = [],
  loading,
  showOrganization,
  onOpen,
  onOpenDraft,
  onCreate,
}: TicketListProps) {
  const [showClosed, setShowClosed] = useState(false);
  const openTickets = tickets.filter((ticket) => ticket.status !== 'CLOSED');
  const closedTickets = tickets.filter((ticket) => ticket.status === 'CLOSED');
  const ticketIdsWithDraft = new Set(drafts.map((draft) => draft.ticketId).filter((id): id is number => id != null));
  // An open ticket with an unsent reply is already listed under Concepten; don't show it twice.
  const openTicketsWithoutDraft = openTickets.filter((ticket) => !ticketIdsWithDraft.has(ticket.id));

  function renderRows(list: TicketSummary[]) {
    return (
      <div className="ticket-list">
        {list.map((ticket) => (
          <button className="ticket-row" key={ticket.id} onClick={() => onOpen(ticket)} type="button">
            <span className={`ticket-row-icon ${ticket.status === 'CLOSED' ? 'closed' : ''}`}>
              {ticket.status === 'CLOSED' ? <CheckCircle2 size={18} /> : <MessageSquare size={18} />}
            </span>
            <div>
              <strong>{ticket.subject}</strong>
              <small>
                {showOrganization && ticket.organizationName ? `${ticket.organizationName} · ` : ''}
                {ticket.messageCount} bericht{ticket.messageCount === 1 ? '' : 'en'} · {timeAgo(ticket.updatedAt)}
              </small>
            </div>
            {ticketIdsWithDraft.has(ticket.id) && (
              <span className="status-pill status-amber" title="Je hebt hier een onverstuurde reactie">
                <span className="status-dot" />
                Concept
              </span>
            )}
            <span className={`status-pill ${ticket.status === 'OPEN' ? 'status-blue' : 'status-slate'}`}>
              <span className="status-dot" />
              {ticket.status === 'OPEN' ? 'Open' : 'Gesloten'}
            </span>
          </button>
        ))}
      </div>
    );
  }

  const draftsSection = !loading && drafts.length > 0 && (
    <div className="ticket-drafts">
      <div className="ticket-drafts-heading">
        <FileClock size={16} />
        <h3>Concepten</h3>
        <span className="ticket-closed-count">{drafts.length}</span>
      </div>
      <div className="ticket-list">
        {drafts.map((draft) => (
          <button className="ticket-row" key={draft.id} onClick={() => onOpenDraft?.(draft)} type="button">
            <span className="ticket-row-icon draft">
              <FileClock size={18} />
            </span>
            <div>
              <strong>
                {draft.ticketId != null
                  ? `Reactie op: ${draft.ticketSubject ?? `ticket #${draft.ticketId}`}`
                  : draft.subject?.trim() || 'Nieuw ticket (zonder onderwerp)'}
              </strong>
              <small>
                {draftPreview(draft)} · {timeAgo(draft.updatedAt)}
              </small>
            </div>
            <span className="status-pill status-amber">
              <span className="status-dot" />
              Concept
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <section className="table-section">
      <div className="section-title">
        <div>
          <p className="eyebrow">Support</p>
          <h2>Open tickets</h2>
        </div>
        <button className="primary-button" onClick={onCreate}>
          <Plus size={18} /> Nieuw ticket
        </button>
      </div>

      {loading && <p className="hint-text" style={{ marginTop: 20 }}>Tickets laden...</p>}

      {draftsSection}

      {!loading && openTickets.length === 0 && (
        <div className="empty-state" style={{ marginTop: 20 }}>
          <Ticket size={26} />
          <strong>Geen open tickets</strong>
          <span>Maak een nieuw ticket aan als je ergens hulp bij nodig hebt.</span>
        </div>
      )}

      {!loading && openTicketsWithoutDraft.length > 0 && renderRows(openTicketsWithoutDraft)}

      {!loading && closedTickets.length > 0 && (
        <>
          <button
            type="button"
            className="ticket-closed-heading"
            onClick={() => setShowClosed((open) => !open)}
            aria-expanded={showClosed}
          >
            {showClosed ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            <h3>Gesloten tickets</h3>
            <span className="ticket-closed-count">{closedTickets.length}</span>
          </button>
          {showClosed && renderRows(closedTickets)}
        </>
      )}
    </section>
  );
}
