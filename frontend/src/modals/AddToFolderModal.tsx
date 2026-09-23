import { useMemo, useState } from 'react';
import { Check, Search, X } from 'lucide-react';
import { ApiError } from '../api/client';
import { moveDocumentTypeToFolder } from '../api/documentTypes';
import type { DocumentType, Folder } from '../types';

interface AddToFolderModalProps {
  folder: Folder;
  types: DocumentType[];
  onClose: () => void;
  onAdded: (updated: DocumentType[]) => void;
}

export function AddToFolderModal({ folder, types, onClose, onAdded }: AddToFolderModalProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const candidates = useMemo(() => {
    const needle = query.trim().toLowerCase();
    // Only unfiled aanvragen: moving one between folders goes through "Verplaatsen" inside its folder.
    return types
      .filter((type) => !type.folderId)
      .filter((type) =>
        `${type.name} ${type.provider} ${type.organizationName ?? ''}`.toLowerCase().includes(needle)
      );
  }, [types, folder.id, query]);

  function toggle(id: number) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleAdd() {
    setSaving(true);
    setError('');
    try {
      const updated = await Promise.all([...selected].map((id) => moveDocumentTypeToFolder(id, folder.id)));
      onAdded(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Toevoegen is niet gelukt.');
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal folder-picker-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Sluiten">
          <X size={18} />
        </button>
        <p className="eyebrow">Map</p>
        <h2>Toevoegen aan "{folder.name}"</h2>
        <p className="modal-description">
          Aanvragen die nog in geen map zitten. Zoek op naam, klant of opdrachtgever en vink aan wat je in deze map
          wilt zetten.
        </p>

        <div className="search-field folder-picker-search">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Zoek aanvragen..."
            autoFocus
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Zoekopdracht wissen">
              <X size={15} />
            </button>
          )}
        </div>

        <ul className="folder-picker-list">
          {candidates.map((type) => {
            const isSelected = selected.has(type.id);
            return (
              <li key={type.id}>
                <button
                  type="button"
                  className={`folder-picker-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggle(type.id)}
                  aria-pressed={isSelected}
                >
                  <span className="folder-picker-check">{isSelected && <Check size={12} />}</span>
                  <span className="folder-picker-copy">
                    <strong>{type.name}</strong>
                    <small>
                      {type.organizationName ?? 'Intern'} · {type.provider}
                    </small>
                  </span>
                </button>
              </li>
            );
          })}
          {candidates.length === 0 && (
            <li className="folder-picker-empty">
              {query
                ? 'Geen aanvragen gevonden voor deze zoekopdracht.'
                : 'Alle aanvragen zitten al in een map. Verplaats ze vanuit hun huidige map.'}
            </li>
          )}
        </ul>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose} disabled={saving}>
            Annuleren
          </button>
          <button type="button" className="primary-button" onClick={handleAdd} disabled={selected.size === 0 || saving}>
            {saving ? 'Bezig...' : `Toevoegen${selected.size > 0 ? ` (${selected.size})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
