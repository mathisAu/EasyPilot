import { useState, type FormEvent } from 'react';
import { Plus, X } from 'lucide-react';
import { createTicket } from '../api/support';
import { ApiError } from '../api/client';
import type { TicketDetail } from '../types';

interface NewTicketModalProps {
  onClose: () => void;
  onCreated: (ticket: TicketDetail) => void;
}

export function NewTicketModal({ onClose, onCreated }: NewTicketModalProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = subject.trim().length > 0 && message.trim().length > 0;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      const ticket = await createTicket({ subject: subject.trim(), message: message.trim() });
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

  return (
    <div className="modal-backdrop" onClick={submitting ? undefined : onClose}>
      <form className="modal" onClick={(event) => event.stopPropagation()} onSubmit={handleSubmit}>
        {!submitting && (
          <button type="button" className="modal-close" onClick={onClose} aria-label="Sluiten">
            <X size={18} />
          </button>
        )}
        <p className="eyebrow">Support</p>
        <h2>Nieuw ticket</h2>
        <p className="modal-description">Beschrijf je vraag zo duidelijk mogelijk, dan helpen we je snel verder.</p>
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
          <button type="button" className="secondary-button" onClick={onClose} disabled={submitting}>
            Annuleren
          </button>
          <button type="submit" className="primary-button" disabled={!canSubmit || submitting}>
            <Plus size={16} /> {submitting ? 'Bezig...' : 'Ticket aanmaken'}
          </button>
        </div>
      </form>
    </div>
  );
}
