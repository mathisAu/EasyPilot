import { CheckCircle2, MessageSquare, Plus, Ticket } from 'lucide-react';
import type { TicketSummary } from '../types';

interface TicketListProps {
  tickets: TicketSummary[];
  loading: boolean;
  showOrganization?: boolean;
  onOpen: (ticket: TicketSummary) => void;
  onCreate: () => void;
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

export function TicketList({ tickets, loading, showOrganization, onOpen, onCreate }: TicketListProps) {
  return (
    <section className="table-section">
      <div className="section-title">
        <div>
          <p className="eyebrow">Support</p>
          <h2>Tickets</h2>
        </div>
        <button className="primary-button" onClick={onCreate}>
          <Plus size={18} /> Nieuw ticket
        </button>
      </div>

      {loading && <p className="hint-text" style={{ marginTop: 20 }}>Tickets laden...</p>}

      {!loading && tickets.length === 0 && (
        <div className="empty-state" style={{ marginTop: 20 }}>
          <Ticket size={26} />
          <strong>Nog geen tickets</strong>
          <span>Maak een nieuw ticket aan als je ergens hulp bij nodig hebt.</span>
        </div>
      )}

      {!loading && tickets.length > 0 && (
        <div className="ticket-list">
          {tickets.map((ticket) => (
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
              <span className={`status-pill ${ticket.status === 'OPEN' ? 'status-blue' : 'status-slate'}`}>
                <span className="status-dot" />
                {ticket.status === 'OPEN' ? 'Open' : 'Gesloten'}
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
