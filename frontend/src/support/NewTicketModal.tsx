import { useState, type FormEvent } from 'react';
import { FileClock, Plus, Trash2, X } from 'lucide-react';
import { createTicket, createTicketDraft, deleteTicketDraft, updateTicketDraft } from '../api/support';
import { ApiError } from '../api/client';
import type { TicketDetail, TicketDraft } from '../types';
import { useAuth } from '../auth/AuthContext';

interface NewTicketModalProps {
  /** An unsubmitted ticket being picked up again; submitting it removes the concept. */
  draft?: TicketDraft | null;
  onClose: () => void;
  onCreated: (ticket: TicketDetail) => void;
  onDraftChanged?: () => void;
}

export function NewTicketModal({ draft, onClose, onCreated, onDraftChanged }: NewTicketModalProps) {
  const [subject, setSubject] = useState(draft?.subject ?? '');
  const [message, setMessage] = useState(draft?.body ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  // Parking an unfinished new ticket is an admin tool; customers just submit.
  const canUseDrafts = user?.role === 'ADMIN';

  const canSubmit = subject.trim().length > 0 && message.trim().length > 0;
  const canSaveDraft = subject.trim().length > 0 || message.trim().length > 0;
  const busy = submitting || savingDraft;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      const ticket = await createTicket({ subject: subject.trim(), message: message.trim() });
      if (draft) {
        await deleteTicketDraft(draft.id).catch(() => {});
        onDraftChanged?.();
      }
      onCreated(ticket);
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError(err.message);
      } else {
        setError(err instanceof ApiError ? err.message : 'Aanmaken is niet gelukt. Probeer het opnieuw.');
      }
      setSubmitting(false);
    }
  }

  async function handleSaveDraft() {
    if (!canSaveDraft) return;
    setSavingDraft(true);
    setError('');
    try {
      const input = { subject, body: message };
      if (draft) {
        await updateTicketDraft(draft.id, input);
      } else {
        await createTicketDraft(input);
      }
      onDraftChanged?.();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Concept opslaan is niet gelukt.');
      setSavingDraft(false);
    }
  }

  async function handleDiscardDraft() {
    if (!draft || !window.confirm('Dit concept verwijderen?')) return;
    setSavingDraft(true);
    try {
      await deleteTicketDraft(draft.id);
      onDraftChanged?.();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Concept verwijderen is niet gelukt.');
      setSavingDraft(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={busy ? undefined : onClose}>
      <form className="modal" onClick={(event) => event.stopPropagation()} onSubmit={handleSubmit}>
        {!busy && (
          <button type="button" className="modal-close" onClick={onClose} aria-label="Sluiten">
            <X size={18} />
          </button>
        )}
        <p className="eyebrow">{draft ? 'Concept' : 'Support'}</p>
        <h2>{draft ? 'Concept afmaken' : 'Nieuw ticket'}</h2>
        <p className="modal-description">
          Beschrijf je vraag zo duidelijk mogelijk, dan helpen we je snel verder.
          {canUseDrafts && ' Nog niet klaar? Sla het op als concept en maak het later af.'}
        </p>
        <label>
          Onderwerp
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Bijv. Documenttype wordt niet herkend"
            maxLength={150}
            autoFocus
          />
        </label>
        <label>
          Bericht
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Beschrijf je vraag of probleem..."
            maxLength={5000}
            rows={5}
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <div className="modal-actions">
          {draft && (
            <button type="button" className="text-button draft-discard" onClick={handleDiscardDraft} disabled={busy}>
              <Trash2 size={14} /> Concept verwijderen
            </button>
          )}
          {canUseDrafts ? (
            <button type="button" className="secondary-button" onClick={handleSaveDraft} disabled={!canSaveDraft || busy}>
              <FileClock size={16} /> {savingDraft ? 'Bezig...' : 'Als concept opslaan'}
            </button>
          ) : (
            <button type="button" className="secondary-button" onClick={onClose} disabled={busy}>
              Annuleren
            </button>
          )}
          <button type="submit" className="primary-button" disabled={!canSubmit || busy}>
            <Plus size={16} /> {submitting ? 'Bezig...' : 'Ticket aanmaken'}
          </button>
        </div>
      </form>
    </div>
  );
}
