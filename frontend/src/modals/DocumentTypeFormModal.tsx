import { useState, type FormEvent } from 'react';
import { Plus, Save, X } from 'lucide-react';
import { createDocumentType, updateDocumentType } from '../api/documentTypes';
import { ApiError } from '../api/client';
import { STAGE_ORDER } from '../data';
import type { DocumentType, RequestStatus } from '../types';

interface DocumentTypeFormModalProps {
  mode: 'create' | 'edit';
  initial?: DocumentType | null;
  onClose: () => void;
  onSaved: (type: DocumentType, mode: 'create' | 'edit') => void;
}

export function DocumentTypeFormModal({ mode, initial, onClose, onSaved }: DocumentTypeFormModalProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [provider, setProvider] = useState(initial?.provider ?? '');
  const [status, setStatus] = useState<RequestStatus>(initial?.status ?? 'Aangeleverd');
  const [fields, setFields] = useState<string[]>(initial?.fieldList ?? []);
  const [fieldDraft, setFieldDraft] = useState('');
  const [showFieldInput, setShowFieldInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function addField() {
    const label = fieldDraft.trim();
    if (label && !fields.includes(label)) {
      setFields((current) => [...current, label]);
    }
    setFieldDraft('');
    setShowFieldInput(false);
  }

  function removeField(label: string) {
    setFields((current) => current.filter((item) => item !== label));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !provider.trim()) return;

    setSubmitting(true);
    setError('');
    try {
      const payload = { name: name.trim(), provider: provider.trim(), status, fields };
      const result = mode === 'create'
        ? await createDocumentType(payload)
        : await updateDocumentType(initial!.id, payload);
      onSaved(result, mode);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Opslaan is niet gelukt. Probeer het opnieuw.');
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
        <p className="eyebrow">Configuratie</p>
        <h2>{mode === 'create' ? 'Nieuw documenttype' : 'Documenttype bewerken'}</h2>
        <p className="modal-description">
          {mode === 'create' ? 'Leg een nieuw documenttype vast.' : 'Wijzig de gegevens van dit documenttype.'}
        </p>

        <label>
          Naam
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Bijv. Transportopdracht" autoFocus />
        </label>
        <label>
          Provider
          <input value={provider} onChange={(event) => setProvider(event.target.value)} placeholder="Bijv. BMN" />
        </label>

        <label>
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value as RequestStatus)}>
            {STAGE_ORDER.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <h3 className="drawer-subheading">Velden</h3>
        <div className="field-chip-list">
          {fields.map((field) => (
            <span className="field-chip removable" key={field}>
              {field}
              <button type="button" onClick={() => removeField(field)} aria-label={`Verwijder veld ${field}`}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        {showFieldInput ? (
          <div className="custom-field-input">
            <input
              value={fieldDraft}
              onChange={(event) => setFieldDraft(event.target.value)}
              placeholder="Naam van het veld"
              autoFocus
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addField();
                }
              }}
            />
            <button type="button" className="secondary-button" onClick={addField}>
              Toevoegen
            </button>
          </div>
        ) : (
          <button type="button" className="add-field-button" onClick={() => setShowFieldInput(true)}>
            <Plus size={15} /> Veld toevoegen
          </button>
        )}

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose} disabled={submitting}>
            Annuleren
          </button>
          <button type="submit" className="primary-button" disabled={submitting || !name.trim() || !provider.trim()}>
            <Save size={16} /> {submitting ? 'Bezig...' : 'Opslaan'}
          </button>
        </div>
      </form>
    </div>
  );
}
