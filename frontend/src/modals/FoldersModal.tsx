import { useMemo, useState } from 'react';
import { Check, Folder as FolderIcon, Search, X } from 'lucide-react';
import type { DocumentType, Folder } from '../types';

interface FoldersModalProps {
  folders: Folder[];
  types: DocumentType[];
  activeFolderId: number | null;
  onSelect: (folder: Folder) => void;
  onClose: () => void;
}

export function FoldersModal({ folders, types, activeFolderId, onSelect, onClose }: FoldersModalProps) {
  const [query, setQuery] = useState('');

  const visibleFolders = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return [...folders]
      .filter((folder) => folder.name.toLowerCase().includes(needle))
      .sort((a, b) => a.name.localeCompare(b.name, 'nl', { sensitivity: 'base' }));
  }, [folders, query]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal folder-picker-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Sluiten">
          <X size={18} />
        </button>
        <p className="eyebrow">Mappen</p>
        <h2>Alle mappen</h2>
        <p className="modal-description">Op alfabetische volgorde. Klik op een map om hem te openen.</p>

        {folders.length > 0 && (
          <div className="search-field folder-picker-search">
            <Search size={17} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Zoek een map..."
              autoFocus
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label="Zoekopdracht wissen">
                <X size={15} />
              </button>
            )}
          </div>
        )}

        <ul className="folder-picker-list">
          {visibleFolders.map((folder) => {
            const count = types.filter((type) => type.folderId === folder.id).length;
            const isActive = folder.id === activeFolderId;
            return (
              <li key={folder.id}>
                <button
                  type="button"
                  className={`folder-picker-item ${isActive ? 'selected' : ''}`}
                  onClick={() => onSelect(folder)}
                >
                  <FolderIcon size={16} className="folder-list-icon" />
                  <span className="folder-picker-copy">
                    <strong>{folder.name}</strong>
                    <small>
                      {count} {count === 1 ? 'aanvraag' : 'aanvragen'}
                    </small>
                  </span>
                  {isActive && <Check size={16} className="folder-list-current" />}
                </button>
              </li>
            );
          })}
          {visibleFolders.length === 0 && (
            <li className="folder-picker-empty">
              {folders.length === 0
                ? 'Nog geen mappen. Maak er een aan met "Nieuwe map".'
                : 'Geen map gevonden met deze naam.'}
            </li>
          )}
        </ul>

        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
}
