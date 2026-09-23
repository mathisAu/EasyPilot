import { useEffect, useState } from 'react';
import { TicketList } from '../support/TicketList';
import { NewTicketModal } from '../support/NewTicketModal';
import { TicketDrawer } from '../support/TicketDrawer';
import { listTickets, getTicket, listDrafts } from '../api/support';
import { ApiError } from '../api/client';
import type { TicketDetail, TicketDraft, TicketSummary } from '../types';

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
  const [drafts, setDrafts] = useState<TicketDraft[]>([]);
  const [newTicketDraft, setNewTicketDraft] = useState<TicketDraft | null>(null);

  function refresh() {
    setLoading(true);
    listTickets()
      .then(setTickets)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Kon tickets niet laden.'))
      .finally(() => setLoading(false));
  }

  function refreshDrafts() {
    listDrafts().then(setDrafts).catch(() => {});
  }

  useEffect(refresh, []);
  useEffect(refreshDrafts, []);

  function openDraft(draft: TicketDraft) {
    if (draft.ticketId != null) {
      openTicketById(draft.ticketId);
    } else {
      setNewTicketDraft(draft);
      setShowNewTicket(true);
    }
  }

  function closeNewTicket() {
    setShowNewTicket(false);
    setNewTicketDraft(null);
  }

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
    closeNewTicket();
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
        drafts={drafts}
        loading={loading}
        showOrganization
        onOpen={(ticket) => openTicketById(ticket.id)}
        onOpenDraft={openDraft}
        onCreate={() => setShowNewTicket(true)}
      />

      {showNewTicket && (
        <NewTicketModal
          draft={newTicketDraft}
          onClose={closeNewTicket}
          onCreated={handleCreated}
          onDraftChanged={refreshDrafts}
        />
      )}
      {openTicket && (
        <TicketDrawer
          ticket={openTicket}
          onClose={() => setOpenTicket(null)}
          onChanged={handleChanged}
          onDraftChanged={refreshDrafts}
        />
      )}
    </>
  );
}
