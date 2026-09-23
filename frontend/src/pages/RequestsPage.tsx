import { useMemo } from 'react';
import { Eye, FileCheck2, FileText, Folder as FolderIcon, FolderMinus, FolderSymlink, Search, Sparkles, SlidersHorizontal, Trash2, X } from 'lucide-react';
import { Metric } from '../components/Metric';
import { StatusPill } from '../components/StatusPill';
import { stages, toneFor } from '../data';
import { AddToFolderModal } from '../modals/AddToFolderModal';
import { FoldersModal } from '../modals/FoldersModal';
import { FolderBar } from '../folders/FolderBar';
import { useFolderManagement } from '../folders/useFolderManagement';
import type { DocumentType, RequestStatus } from '../types';

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
  const folderMgmt = useFolderManagement(types, onTypeUpdated);
  const {
    folders,
    folderFilter,
    setFolderFilter,
    creatingFolder,
    setCreatingFolder,
    newFolderName,
    setNewFolderName,
    folderError,
    showPicker,
    setShowPicker,
    showFolders,
    setShowFolders,
    movingType,
    setMovingType,
    activeFolder,
    matchesFolder,
    handleCreateFolder,
    handleDeleteFolder,
    handleMoveToFolder,
    handleRemoveFromFolder,
  } = folderMgmt;

  const filteredTypes = useMemo(
    () =>
      types
        .filter((type) =>
          `${type.organizationName ?? ''} ${type.provider} ${type.name}`.toLowerCase().includes(search.toLowerCase())
        )
        .filter((type) => !statusFilter || type.status === statusFilter)
        .filter(matchesFolder),
    [types, search, statusFilter, matchesFolder]
  );

  const inBehandeling = types.filter((type) =>
    (['In beoordeling', 'Inleren', 'Testen', 'Correctie nodig'] as RequestStatus[]).includes(type.status)
  ).length;
  const goedgekeurd = types.filter((type) => type.status === 'Goedgekeurd').length;
  const live = types.filter((type) => type.status === 'Live').length;

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
            <h2>Documentaanvragen</h2>
          </div>
          <button
            className={`filter-button ${statusFilter ? 'filter-button-active' : ''}`}
            onClick={() => onToggleStatusFilter('In beoordeling')}
          >
            <SlidersHorizontal size={16} /> Filter
          </button>
        </div>

        <FolderBar
          types={types}
          folders={folders}
          folderFilter={folderFilter}
          activeFolder={activeFolder}
          creatingFolder={creatingFolder}
          newFolderName={newFolderName}
          itemLabel="Aanvragen"
          onSelectFilter={setFolderFilter}
          onOpenFolders={() => setShowFolders(true)}
          onStartCreating={() => setCreatingFolder(true)}
          onCancelCreating={() => {
            setCreatingFolder(false);
            setNewFolderName('');
          }}
          onNewFolderNameChange={setNewFolderName}
          onCreateFolder={(event) => {
            event.preventDefault();
            handleCreateFolder(newFolderName);
          }}
          onOpenAddPicker={() => setShowPicker(true)}
          onDeleteFolder={handleDeleteFolder}
        />
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
                    <button
                      type="button"
                      className="customer-cell customer-cell-link"
                      onClick={() => onViewType(type)}
                      title={`${type.name} van ${type.organizationName ?? 'intern'} bekijken`}
                    >
                      <span className="customer-logo">{type.provider.slice(0, 1)}</span>
                      <strong>{type.organizationName ?? '—'}</strong>
                    </button>
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
                          onClick={() => setMovingType(type)}
                          aria-label={`Verplaats ${type.name} naar een andere map`}
                          title="Verplaatsen naar andere map"
                        >
                          <FolderSymlink size={16} />
                        </button>
                      )}
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

      {showFolders && (
        <FoldersModal
          folders={folders}
          types={types}
          activeFolderId={activeFolder ? activeFolder.id : null}
          onSelect={(folder) => {
            setFolderFilter(folder.id);
            setShowFolders(false);
          }}
          onClose={() => setShowFolders(false)}
        />
      )}

      {movingType && (
        <FoldersModal
          folders={folders}
          types={types}
          activeFolderId={null}
          excludeFolderId={movingType.folderId ?? undefined}
          title={`"${movingType.name}" verplaatsen`}
          description={`Kies de map waar deze aanvraag naartoe moet${
            movingType.folderName ? ` (nu in "${movingType.folderName}")` : ''
          }.`}
          onSelect={(folder) => handleMoveToFolder(movingType, folder)}
          onClose={() => setMovingType(null)}
        />
      )}

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
