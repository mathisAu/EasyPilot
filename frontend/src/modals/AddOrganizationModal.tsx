import { useState, type FormEvent } from 'react';
import { Plus, X } from 'lucide-react';
import { createOrganization } from '../api/organizations';
import { ApiError } from '../api/client';
import type { Organization } from '../types';

interface AddOrganizationModalProps {
  onClose: () => void;
  onSubmit: (organization: Organization) => void;
}

export function AddOrganizationModal({ onClose, onSubmit }: AddOrganizationModalProps) {
  const [name, setName] = useState('');
  const [customerUsername, setCustomerUsername] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = name.trim() && customerUsername.trim() && customerPassword.trim().length >= 6;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      const organization = await createOrganization({
        name: name.trim(),
        customerUsername: customerUsername.trim(),
        customerPassword,
      });
      onSubmit(organization);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Aanmaken is niet gelukt. Probeer het opnieuw.');
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
        <p className="eyebrow">Werkruimte</p>
        <h2>Organisatie toevoegen</h2>
        <p className="modal-description">
          Voeg een nieuwe klant toe aan je werkruimte. Dit maakt meteen een klantportaal-login aan.
        </p>
        <label>
          Organisatienaam
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Bijv. Bakker Transport" autoFocus />
        </label>
        <label>
          Gebruikersnaam klantportaal
          <input
            value={customerUsername}
            onChange={(event) => setCustomerUsername(event.target.value)}
            placeholder="Bijv. bakker.transport"
          />
        </label>
        <label>
          Wachtwoord klantportaal
          <input
            type="password"
            value={customerPassword}
            onChange={(event) => setCustomerPassword(event.target.value)}
            placeholder="Minimaal 6 tekens"
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose} disabled={submitting}>
            Annuleren
          </button>
          <button type="submit" className="primary-button" disabled={!canSubmit || submitting}>
            <Plus size={16} /> {submitting ? 'Bezig...' : 'Organisatie toevoegen'}
          </button>
        </div>
      </form>
    </div>
  );
}
