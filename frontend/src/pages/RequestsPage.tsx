import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Eye,
  FileCheck2,
  FileText,
  Folder as FolderIcon,
  FolderInput,
  FolderMinus,
  FolderPlus,
  Search,
  Sparkles,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import { Metric } from '../components/Metric';
import { StatusPill } from '../components/StatusPill';
import { stages, toneFor } from '../data';
import { ApiError } from '../api/client';
import { createFolder, deleteFolder, listFolders } from '../api/folders';
import { moveDocumentTypeToFolder } from '../api/documentTypes';
import { AddToFolderModal } from '../modals/AddToFolderModal';
import type { DocumentType, Folder, RequestStatus } from '../types';

interface RequestsPageProps {
  types: DocumentType[];
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: RequestStatus | null;
  onToggleStatusFilter: (label: RequestStatus) => void;
  onViewType: (type: DocumentType) => void;
  onDeleteType: (id: number) => void;
  onTypeUpdated: (type: DocumentType) => void;
}

type FolderFilter = 'all' | 'none' | number;

function formatDate(value?: string): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('nl-NL');
}

export function RequestsPage({
  types,
  search,
  onSearchChange,
  statusFilter,
  onToggleStatusFilter,
  onViewType,
  onDeleteType,
  onTypeUpdated,
}: RequestsPageProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [folderFilter, setFolderFilter] = useState<FolderFilter>('all');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderError, setFolderError] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    listFolders()
      .then(setFolders)
      .catch((err) => setFolderError(err instanceof ApiError ? err.message : 'Kon mappen niet laden.'));
  }, []);

  const filteredTypes = useMemo(
    () =>
      types
        .filter((type) =>
          `${type.organizationName ?? ''} ${type.provider} ${type.name}`.toLowerCase().includes(search.toLowerCase())
        )
        .filter((type) => !statusFilter || type.status === statusFilter)
        .filter((type) => {
          if (folderFilter === 'all') return true;
          if (folderFilter === 'none') return !type.folderId;
          return type.folderId === folderFilter;
        }),
    [types, search, statusFilter, folderFilter]
  );

  const inBehandeling = types.filter((type) =>
    (['In beoordeling', 'Inleren', 'Testen', 'Correctie nodig'] as RequestStatus[]).includes(type.status)
  ).length;
  const goedgekeurd = types.filter((type) => type.status === 'Goedgekeurd').length;
  const live = types.filter((type) => type.status === 'Live').length;

  async function handleCreateFolder(event: FormEvent) {
    event.preventDefault();
    const name = newFolderName.trim();
    if (!name) return;
    setFolderError('');
    try {
      const folder = await createFolder(name);
      setFolders((current) => [...current, folder].sort((a, b) => a.name.localeCompare(b.name, 'nl')));
      setNewFolderName('');
      setCreatingFolder(false);
      setFolderFilter(folder.id);
      setShowPicker(true);
    } catch (err) {
      setFolderError(err instanceof ApiError ? err.message : 'Map aanmaken is niet gelukt.');
    }
  }

  async function handleDeleteFolder(folder: Folder) {
    if (!window.confirm(`Map "${folder.name}" verwijderen? De documenttypes erin blijven gewoon bestaan.`)) return;
    setFolderError('');
    try {
      await deleteFolder(folder.id);
      setFolders((current) => current.filter((item) => item.id !== folder.id));
      types
        .filter((type) => type.folderId === folder.id)
        .forEach((type) => onTypeUpdated({ ...type, folderId: null, folderName: null }));
      setFolderFilter('all');
    } catch (err) {
      setFolderError(err instanceof ApiError ? err.message : 'Map verwijderen is niet gelukt.');
    }
  }

  async function handleRemoveFromFolder(type: DocumentType) {
    setFolderError('');
    try {
      onTypeUpdated(await moveDocumentTypeToFolder(type.id, null));
    } catch (err) {
      setFolderError(err instanceof ApiError ? err.message : 'Uit de map halen is niet gelukt.');
    }
  }

  const activeFolder = typeof folderFilter === 'number' ? folders.find((folder) => folder.id === folderFilter) : null;

  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">Interne verwerking</p>
          <h1>Documentaanvragen</h1>
          <p className="page-description">Alle aangeleverde documenttypes op één plek.</p>
        </div>
      </section>

      <section className="metrics-grid" aria-label="Overzicht aanvragen">
        <Metric icon={FileText} label="Totaal aanvragen" value={types.length} note="Alle documenttypes" />
        <Metric icon={Search} label="In behandeling" value={inBehandeling} note="In beoordeling t/m correctie" tone="blue" />
        <Metric icon={Sparkles} label="Goedgekeurd" value={goedgekeurd} note="Klaar voor live" tone="amber" />
        <Metric icon={FileCheck2} label="Live bij klanten" value={live} note="Automatisch verwerkt" tone="green" />
      </section>

      <section className="process-band">
        <div className="section-title">
          <div>
            <p className="eyebrow">Workflow</p>
            <h2>Waar staan de aanvragen?</h2>
          </div>
          <span className="hint-text">Klik op een fase om te filteren</span>
        </div>
        <div className="stage-track">
          {stages.map((stage, index) => (
            <button
              className={`stage-wrap stage-button ${statusFilter === stage.label ? 'stage-active' : ''}`}
              key={stage.label}
              onClick={() => onToggleStatusFilter(stage.label)}
            >
              <div className={`stage-icon ${stage.tone}`}>
                <stage.icon size={17} />
              </div>
              <div className="stage-copy">
                <strong>{types.filter((type) => type.status === stage.label).length}</strong>
                <span>{stage.label}</span>
              </div>
              {index < stages.length - 1 && <div className="stage-line" />}
            </button>
          ))}
        </div>
      </section>

      <section className="table-section">
        <div className="section-title">
          <div>
            <p className="eyebrow">Overzicht aanvragen</p>
            <h2>Recente documentaanvragen</h2>
          </div>
          <button
            className={`filter-button ${statusFilter ? 'filter-button-active' : ''}`}
            onClick={() => onToggleStatusFilter('In beoordeling')}
          >
            <SlidersHorizontal size={16} /> Filter
          </button>
        </div>

        <div className="folder-bar" role="tablist" aria-label="Mappen">
          <button
            type="button"
            className={`folder-chip ${folderFilter === 'all' ? 'active' : ''}`}
            onClick={() => setFolderFilter('all')}
          >
            Alle <span>{types.length}</span>
          </button>
          <button
            type="button"
            className={`folder-chip ${folderFilter === 'none' ? 'active' : ''}`}
            onClick={() => setFolderFilter('none')}
          >
            Zonder map <span>{types.filter((type) => !type.folderId).length}</span>
          </button>
          {folders.map((folder) => (
            <button
              type="button"
              key={folder.id}
              className={`folder-chip ${folderFilter === folder.id ? 'active' : ''}`}
              onClick={() => setFolderFilter(folder.id)}
            >
              <FolderIcon size={13} /> {folder.name}{' '}
              <span>{types.filter((type) => type.folderId === folder.id).length}</span>
            </button>
          ))}
          {creatingFolder ? (
            <form className="folder-new-form" onSubmit={handleCreateFolder}>
              <input
                value={newFolderName}
                onChange={(event) => setNewFolderName(event.target.value)}
                placeholder="Naam van de map"
                maxLength={60}
                autoFocus
              />
              <button type="submit" className="folder-chip active" disabled={!newFolderName.trim()}>
                Aanmaken
              </button>
              <button
                type="button"
                className="folder-chip"
                onClick={() => {
                  setCreatingFolder(false);
                  setNewFolderName('');
                }}
              >
                Annuleren
              </button>
            </form>
          ) : (
            <button type="button" className="folder-chip folder-chip-new" onClick={() => setCreatingFolder(true)}>
              <FolderPlus size={13} /> Nieuwe map
            </button>
          )}
          {activeFolder && (
            <div className="folder-bar-actions">
              <button type="button" className="primary-button folder-add-button" onClick={() => setShowPicker(true)}>
                <FolderInput size={15} /> Aanvragen toevoegen
              </button>
              <button
                type="button"
                className="folder-delete"
                onClick={() => handleDeleteFolder(activeFolder)}
                title={`Map "${activeFolder.name}" verwijderen`}
              >
                <Trash2 size={13} /> Map verwijderen
              </button>
            </div>
          )}
        </div>
        {folderError && <p className="form-error">{folderError}</p>}

        <div className="table-toolbar">
          <div className="search-field">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Zoek op klant, leverancier..."
            />
            {search && (
              <button onClick={() => onSearchChange('')} aria-label="Zoekopdracht wissen">
                <X size={15} />
              </button>
            )}
          </div>
          {statusFilter && (
            <button className="active-filter-chip" onClick={() => onToggleStatusFilter(statusFilter)}>
              {statusFilter} <X size={13} />
            </button>
          )}
          <span className="result-count">
            {filteredTypes.length} van {types.length} aanvragen
          </span>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Klant</th>
                <th>Opdrachtgever</th>
                <th>Documenttype</th>
                <th>Aangeleverd</th>
                <th>Status</th>
                <th>Map</th>
                <th aria-label="Acties" />
              </tr>
            </thead>
            <tbody>
              {filteredTypes.map((type) => (
                <tr key={type.id}>
                  <td>
                    <div className="customer-cell">
                      <span className="customer-logo">{type.provider.slice(0, 1)}</span>
                      <strong>{type.organizationName ?? '—'}</strong>
                    </div>
                  </td>
                  <td>{type.provider}</td>
                  <td>{type.name}</td>
                  <td>{formatDate(type.createdAt)}</td>
                  <td>
                    <StatusPill tone={toneFor(type.status)}>{type.status}</StatusPill>
                  </td>
                  <td>
                    {type.folderName ? (
                      <span className="folder-tag">
                        <FolderIcon size={12} /> {type.folderName}
                      </span>
                    ) : (
                      <span className="document-cell-empty">—</span>
                    )}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="row-action"
                        onClick={() => onViewType(type)}
                        aria-label={`Bekijk ${type.name}`}
                        title="Bekijken"
                      >
                        <Eye size={16} />
                      </button>
                      {activeFolder && (
                        <button
                          className="row-action"
                          onClick={() => handleRemoveFromFolder(type)}
                          aria-label={`Haal ${type.name} uit de map`}
                          title="Uit deze map halen"
                        >
                          <FolderMinus size={16} />
                        </button>
                      )}
                      <button
                        className="row-action row-action-danger"
                        onClick={() => onDeleteType(type.id)}
                        aria-label={`Verwijder ${type.name}`}
                        title="Aanvraag verwijderen"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTypes.length === 0 && (
            <div className="empty-state">
              <Search size={22} />
              <strong>Geen aanvragen gevonden</strong>
              <span>
                {folderFilter === 'all'
                  ? 'Probeer een andere zoekopdracht of filter.'
                  : folderFilter === 'none'
                    ? 'Alle aanvragen zitten in een map.'
                    : 'Deze map is leeg. Klik op "Aanvragen toevoegen" om er iets in te zetten.'}
              </span>
            </div>
          )}
        </div>
      </section>

      {showPicker && activeFolder && (
        <AddToFolderModal
          folder={activeFolder}
          types={types}
          onClose={() => setShowPicker(false)}
          onAdded={(updated) => {
            updated.forEach(onTypeUpdated);
            setShowPicker(false);
          }}
        />
      )}
    </>
  );
}
