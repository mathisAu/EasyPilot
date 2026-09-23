import { useEffect, useState } from 'react';
import { TicketList } from '../support/TicketList';
import { NewTicketModal } from '../support/NewTicketModal';
import { TicketDrawer } from '../support/TicketDrawer';
import { listTickets, getTicket } from '../api/support';
import { ApiError } from '../api/client';
import type { TicketDetail, TicketSummary } from '../types';

interface SupportPageProps {
  focusTicketId?: number | null;
  onFocusHandled?: () => void;
}

export function SupportPage({ focusTicketId, onFocusHandled }: SupportPageProps) {
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [openTicket, setOpenTicket] = useState<TicketDetail | null>(null);
  const [error, setError] = useState('');

  function refresh() {
    setLoading(true);
    listTickets()
      .then(setTickets)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Kon tickets niet laden.'))
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  async function openTicketById(ticketId: number) {
    try {
      const detail = await getTicket(ticketId);
      setOpenTicket(detail);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kon ticket niet laden.');
    }
  }

  useEffect(() => {
    if (focusTicketId != null) {
      openTicketById(focusTicketId);
      onFocusHandled?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusTicketId]);

  function handleCreated(ticket: TicketDetail) {
    setShowNewTicket(false);
    refresh();
    setOpenTicket(ticket);
  }

  function handleChanged(ticket: TicketDetail) {
    setOpenTicket(ticket);
    setTickets((current) =>
      current.map((t) =>
        t.id === ticket.id
          ? { ...t, status: ticket.status, messageCount: ticket.messages.length, updatedAt: ticket.updatedAt }
          : t
      )
    );
  }

  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">Werkruimte</p>
          <h1>Help &amp; support</h1>
          <p className="page-description">Alle supporttickets van klanten en je team.</p>
        </div>
      </section>

      {error && <p className="form-error" style={{ marginTop: 12 }}>{error}</p>}

      <TicketList
        tickets={tickets}
        loading={loading}
        showOrganization
        onOpen={(ticket) => openTicketById(ticket.id)}
        onCreate={() => setShowNewTicket(true)}
      />

      {showNewTicket && <NewTicketModal onClose={() => setShowNewTicket(false)} onCreated={handleCreated} />}
      {openTicket && (
        <TicketDrawer ticket={openTicket} onClose={() => setOpenTicket(null)} onChanged={handleChanged} />
      )}
    </>
  );
}
