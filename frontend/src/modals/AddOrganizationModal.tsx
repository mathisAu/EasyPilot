import { useState, type FormEvent } from 'react';
import { Plus, X } from 'lucide-react';

export interface NewOrganizationResult {
  name: string;
}

interface AddOrganizationModalProps {
  onClose: () => void;
  onSubmit: (result: NewOrganizationResult) => void;
}

export function AddOrganizationModal({ onClose, onSubmit }: AddOrganizationModalProps) {
  const [name, setName] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim() });
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={(event) => event.stopPropagation()} onSubmit={handleSubmit}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Sluiten">
          <X size={18} />
        </button>
        <p className="eyebrow">Werkruimte</p>
        <h2>Organisatie toevoegen</h2>
        <p className="modal-description">Voeg een nieuwe klant toe aan je werkruimte.</p>
        <label>
          Organisatienaam
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Bijv. Bakker Transport" autoFocus />
        </label>
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            Annuleren
          </button>
          <button type="submit" className="primary-button" disabled={!name.trim()}>
            <Plus size={16} /> Organisatie toevoegen
          </button>
        </div>
      </form>
    </div>
  );
}
