import type { FormEvent } from 'react';
import { Folder as FolderIcon, FolderInput, FolderPlus, Trash2 } from 'lucide-react';
import type { DocumentType, Folder } from '../types';
import type { FolderFilter } from './useFolderManagement';

interface FolderBarProps {
  types: DocumentType[];
  folders: Folder[];
  folderFilter: FolderFilter;
  activeFolder: Folder | null;
  creatingFolder: boolean;
  newFolderName: string;
  itemLabel: string;
  onSelectFilter: (filter: FolderFilter) => void;
  onOpenFolders: () => void;
  onStartCreating: () => void;
  onCancelCreating: () => void;
  onNewFolderNameChange: (value: string) => void;
  onCreateFolder: (event: FormEvent) => void;
  onOpenAddPicker: () => void;
  onDeleteFolder: (folder: Folder) => void;
}

export function FolderBar({
  types,
  folders,
  folderFilter,
  activeFolder,
  creatingFolder,
  newFolderName,
  itemLabel,
  onSelectFilter,
  onOpenFolders,
  onStartCreating,
  onCancelCreating,
  onNewFolderNameChange,
  onCreateFolder,
  onOpenAddPicker,
  onDeleteFolder,
}: FolderBarProps) {
  return (
    <div className="folder-bar" role="tablist" aria-label="Mappen">
      <button
        type="button"
        className={`folder-chip ${folderFilter === 'all' ? 'active' : ''}`}
        onClick={() => onSelectFilter('all')}
      >
        Alle <span>{types.length}</span>
      </button>
      <button
        type="button"
        className={`folder-chip ${folderFilter === 'none' ? 'active' : ''}`}
        onClick={() => onSelectFilter('none')}
      >
        Zonder map <span>{types.filter((type) => !type.folderId).length}</span>
      </button>
      <button
        type="button"
        className={`folder-chip ${activeFolder ? 'active' : ''}`}
        onClick={onOpenFolders}
        aria-haspopup="dialog"
      >
        <FolderIcon size={13} /> {activeFolder ? activeFolder.name : 'Mappen'}{' '}
        <span>
          {activeFolder ? types.filter((type) => type.folderId === activeFolder.id).length : folders.length}
        </span>
      </button>
      {creatingFolder ? (
        <form className="folder-new-form" onSubmit={onCreateFolder}>
          <input
            value={newFolderName}
            onChange={(event) => onNewFolderNameChange(event.target.value)}
            placeholder="Naam van de map"
            maxLength={60}
            autoFocus
          />
          <button type="submit" className="folder-chip active" disabled={!newFolderName.trim()}>
            Aanmaken
          </button>
          <button type="button" className="folder-chip" onClick={onCancelCreating}>
            Annuleren
          </button>
        </form>
      ) : (
        <button type="button" className="folder-chip folder-chip-new" onClick={onStartCreating}>
          <FolderPlus size={13} /> Nieuwe map
        </button>
      )}
      {activeFolder && (
        <div className="folder-bar-actions">
          <button type="button" className="primary-button folder-add-button" onClick={onOpenAddPicker}>
            <FolderInput size={15} /> {itemLabel} toevoegen
          </button>
          <button
            type="button"
            className="folder-delete"
            onClick={() => onDeleteFolder(activeFolder)}
            title={`Map "${activeFolder.name}" verwijderen`}
          >
            <Trash2 size={13} /> Map verwijderen
          </button>
        </div>
      )}
    </div>
  );
}
