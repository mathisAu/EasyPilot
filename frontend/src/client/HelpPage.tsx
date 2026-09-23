import { useEffect, useState } from 'react';
import { Mail, MessageCircleQuestion, Phone } from 'lucide-react';
import { TicketList } from '../support/TicketList';
import { NewTicketModal } from '../support/NewTicketModal';
import { TicketDrawer } from '../support/TicketDrawer';
import { listTickets, getTicket, listDrafts } from '../api/support';
import { ApiError } from '../api/client';
import type { TicketDetail, TicketDraft, TicketSummary } from '../types';

const FAQ = [
  {
    question: 'Hoe lever ik een nieuw documenttype aan?',
    answer:
      'Ga naar "Documenten" en klik op "Nieuw documenttype aanleveren". Doorloop de stappen: geef aan van wie de documenten komen, upload een aantal voorbeelden, en kies welke gegevens wij eruit moeten halen.',
  },
  {
    question: 'Hoeveel voorbeelden moet ik aanleveren?',
    answer: 'Minimaal 1, maar bij voorkeur 5 tot 10 verschillende voorbeelden zodat EasyPilot het documenttype goed kan leren.',
  },
  {
    question: 'Wat betekent de status "Wordt ingeleerd"?',
    answer:
      'Dit betekent dat ons team het documenttype aan het inleren en testen is. Zodra het documenttype klaar is voor automatische verwerking, zetten wij het live.',
  },
  {
    question: 'Kan ik later nog extra voorbeelden toevoegen?',
    answer: 'Ja, open het documenttype in het overzicht en upload extra voorbeelden via de documentenlijst.',
  },
];

interface HelpPageProps {
  focusTicketId?: number | null;
  onFocusHandled?: () => void;
}

export function HelpPage({ focusTicketId, onFocusHandled }: HelpPageProps) {
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
      setOpenTicket(await getTicket(ticketId));
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
          <p className="eyebrow">Klantportaal</p>
          <h1>Hulp</h1>
          <p className="page-description">Veelgestelde vragen, support tickets en contactgegevens.</p>
        </div>
      </section>

      {error && <p className="form-error" style={{ marginTop: 12 }}>{error}</p>}

      <TicketList
        tickets={tickets}
        drafts={drafts}
        loading={loading}
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

      <section className="table-section">
        <div className="section-title">
          <div>
            <p className="eyebrow">Veelgestelde vragen</p>
            <h2>Hoe werkt EasyPilot?</h2>
          </div>
        </div>
        <div className="drawer-summary" style={{ gridTemplateColumns: '1fr', gap: 16 }}>
          {FAQ.map((item) => (
            <div key={item.question}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <MessageCircleQuestion size={14} /> {item.question}
              </span>
              <strong style={{ fontWeight: 500 }}>{item.answer}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="callout">
        <div className="callout-icon">
          <Mail size={21} />
        </div>
        <div>
          <strong>Kom je er niet uit?</strong>
          <p>Neem contact op met ons support-team, we helpen je graag verder.</p>
        </div>
        <a className="secondary-button" href="mailto:support@easypilot.nl">
          <Mail size={16} /> support@easypilot.nl
        </a>
      </section>

      <section className="callout">
        <div className="callout-icon">
          <Phone size={21} />
        </div>
        <div>
          <strong>Liever bellen?</strong>
          <p>Ma&ndash;vr van 9:00 tot 17:00 bereikbaar.</p>
        </div>
      </section>
    </>
  );
}
