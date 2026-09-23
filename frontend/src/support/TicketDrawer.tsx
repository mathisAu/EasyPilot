import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Check, CheckCircle2, Pencil, RotateCcw, Send, Trash2, X } from 'lucide-react';
import { Drawer } from '../components/Drawer';
import { addMessage, deleteMessage, editMessage, updateTicketStatus } from '../api/support';
import { ApiError } from '../api/client';
import type { TicketDetail, TicketMessage } from '../types';

const MESSAGE_COOLDOWN_SECONDS = 5;

interface TicketDrawerProps {
  ticket: TicketDetail;
  onClose: () => void;
  onChanged: (ticket: TicketDetail) => void;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function TicketDrawer({ ticket, onClose, onChanged }: TicketDrawerProps) {
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editBody, setEditBody] = useState('');
  const [busyMessageId, setBusyMessageId] = useState<number | null>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [ticket.messages.length]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => setCooldown((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  async function handleSendReply(event: FormEvent) {
    event.preventDefault();
    if (!reply.trim() || sending || cooldown > 0) return;
    setSending(true);
    setError('');
    try {
      const message = await addMessage(ticket.id, reply.trim());
      onChanged({ ...ticket, messages: [...ticket.messages, message], updatedAt: message.createdAt });
      setReply('');
      setCooldown(MESSAGE_COOLDOWN_SECONDS);
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError(err.message);
        setCooldown(err.retryAfterSeconds ?? MESSAGE_COOLDOWN_SECONDS);
      } else {
        setError(err instanceof ApiError ? err.message : 'Versturen is niet gelukt.');
      }
    } finally {
      setSending(false);
    }
  }

  function startEdit(message: TicketMessage) {
    setEditingId(message.id);
    setEditBody(message.body);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditBody('');
  }

  async function saveEdit(messageId: number) {
    if (!editBody.trim()) return;
    setBusyMessageId(messageId);
    try {
      const updated = await editMessage(ticket.id, messageId, editBody.trim());
      onChanged({
        ...ticket,
        messages: ticket.messages.map((m) => (m.id === messageId ? updated : m)),
      });
      setEditingId(null);
      setEditBody('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Bewerken is niet gelukt.');
    } finally {
      setBusyMessageId(null);
    }
  }

  async function handleDelete(messageId: number) {
    if (!window.confirm('Dit bericht verwijderen?')) return;
    setBusyMessageId(messageId);
    try {
      await deleteMessage(ticket.id, messageId);
      onChanged({ ...ticket, messages: ticket.messages.filter((m) => m.id !== messageId) });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Verwijderen is niet gelukt.');
    } finally {
      setBusyMessageId(null);
    }
  }

  async function toggleStatus() {
    const nextStatus = ticket.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      const updated = await updateTicketStatus(ticket.id, nextStatus);
      onChanged(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Status wijzigen is niet gelukt.');
    }
  }

  return (
    <Drawer title={ticket.subject} eyebrow={`Ticket #${ticket.id}`} onClose={onClose}>
      <div className="ticket-drawer-meta">
        <span className={`status-pill ${ticket.status === 'OPEN' ? 'status-blue' : 'status-slate'}`}>
          <span className="status-dot" />
          {ticket.status === 'OPEN' ? 'Open' : 'Gesloten'}
        </span>
        {ticket.organizationName && <span className="field-chip">{ticket.organizationName}</span>}
        <button type="button" className="text-button" onClick={toggleStatus}>
          {ticket.status === 'OPEN' ? (
            <>
              <CheckCircle2 size={14} /> Sluiten
            </>
          ) : (
            <>
              <RotateCcw size={14} /> Heropenen
            </>
          )}
        </button>
      </div>

      <div className="ticket-thread">
        {ticket.messages.map((message) => (
          <div className={`ticket-message ${message.mine ? 'mine' : ''}`} key={message.id}>
            <div className="ticket-message-meta">
              <span className={message.authorRole === 'ADMIN' ? 'role-admin' : 'role-customer'}>
                {message.authorName}
              </span>
              <span>{formatTime(message.createdAt)}</span>
              {message.edited && <span className="ticket-message-edited">bewerkt</span>}
            </div>

            {editingId === message.id ? (
              <div>
                <textarea
                  value={editBody}
                  onChange={(event) => setEditBody(event.target.value)}
                  maxLength={5000}
                  rows={3}
                  autoFocus
                />
                <div className="ticket-message-actions">
                  <button type="button" onClick={() => saveEdit(message.id)} disabled={busyMessageId === message.id} aria-label="Opslaan">
                    <Check size={14} />
                  </button>
                  <button type="button" onClick={cancelEdit} aria-label="Annuleren">
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="ticket-message-body">{message.body}</p>
                {message.mine && (
                  <div className="ticket-message-actions">
                    <button type="button" onClick={() => startEdit(message)} disabled={busyMessageId === message.id} aria-label="Bewerken">
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      className="delete-action"
                      onClick={() => handleDelete(message.id)}
                      disabled={busyMessageId === message.id}
                      aria-label="Verwijderen"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
        <div ref={threadEndRef} />
      </div>

      {ticket.status === 'OPEN' ? (
        <form className="ticket-reply-form" onSubmit={handleSendReply}>
          <textarea
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            placeholder="Typ een reactie..."
            maxLength={5000}
            rows={2}
          />
          <button type="submit" className="primary-button" disabled={!reply.trim() || sending || cooldown > 0}>
            <Send size={16} /> {cooldown > 0 ? `${cooldown}s` : sending ? '...' : ''}
          </button>
        </form>
      ) : (
        <p className="hint-text" style={{ marginTop: 18 }}>
          Dit ticket is gesloten. Heropen het ticket om te reageren.
        </p>
      )}

      {error && <p className="form-error" style={{ marginTop: 10 }}>{error}</p>}
    </Drawer>
  );
}
