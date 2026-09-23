import { useMemo, useState } from 'react';
import {
  Building2,
  ChevronRight,
  File,
  FileImage,
  Files,
  FileText,
  Folder as FolderIcon,
  ListChecks,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { Metric } from '../components/Metric';
import { StatusPill } from '../components/StatusPill';
import { toneFor } from '../data';
import { FolderBar } from '../folders/FolderBar';
import { useFolderManagement } from '../folders/useFolderManagement';
import { AddToFolderModal } from '../modals/AddToFolderModal';
import { FoldersModal } from '../modals/FoldersModal';
import type { DocumentType } from '../types';

interface DocumentTypesPageProps {
  types: DocumentType[];
  onAdd: () => void;
  onView: (type: DocumentType) => void;
  onEdit: (type: DocumentType) => void;
  onDelete: (id: number) => void;
  onTypeUpdated: (type: DocumentType) => void;
}

type FileKind = 'pdf' | 'jpg' | 'png' | 'other';

function fileKindOf(type: DocumentType): FileKind {
  const name = type.latestDocumentFilename?.toLowerCase() ?? '';
  if (name.endsWith('.pdf')) return 'pdf';
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'jpg';
  if (name.endsWith('.png')) return 'png';
  return 'other';
}

const FILE_KIND_ICON: Record<FileKind, typeof FileText> = {
  pdf: FileText,
  jpg: FileImage,
  png: FileImage,
  other: File,
};

const FILE_KIND_LABEL: Record<FileKind, string> = {
  pdf: 'PDF',
  jpg: 'JPG',
  png: 'PNG',
  other: 'Overig',
};

export function DocumentTypesPage({ types, onAdd, onView, onEdit, onDelete, onTypeUpdated }: DocumentTypesPageProps) {
  const [search, setSearch] = useState('');
  const [organizationFilter, setOrganizationFilter] = useState<'all' | number>('all');
  const [fileKindFilter, setFileKindFilter] = useState<'all' | FileKind>('all');

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
    activeFolder,
    matchesFolder,
    handleCreateFolder,
    handleDeleteFolder,
  } = folderMgmt;

  const organizations = useMemo(() => {
    const seen = new Map<number, string>();
    types.forEach((type) => {
      if (type.organizationId != null) {
        seen.set(type.organizationId, type.organizationName ?? `#${type.organizationId}`);
      }
    });
    return [...seen.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'nl'));
  }, [types]);

  const fileKindCounts = useMemo(() => {
    const counts: Record<FileKind, number> = { pdf: 0, jpg: 0, png: 0, other: 0 };
    types.forEach((type) => {
      counts[fileKindOf(type)] += 1;
    });
    return counts;
  }, [types]);

  const filteredTypes = useMemo(
    () =>
      types
        .filter((type) =>
          `${type.organizationName ?? ''} ${type.provider} ${type.name}`.toLowerCase().includes(search.toLowerCase())
        )
        .filter((type) => organizationFilter === 'all' || type.organizationId === organizationFilter)
        .filter((type) => fileKindFilter === 'all' || fileKindOf(type) === fileKindFilter)
        .filter(matchesFolder),
    [types, search, organizationFilter, fileKindFilter, matchesFolder]
  );

  const totalExamples = types.reduce((sum, type) => sum + type.examples, 0);
  const liveCount = types.filter((type) => type.status === 'Live').length;
  const filtersActive =
    search !== '' || organizationFilter !== 'all' || fileKindFilter !== 'all' || folderFilter !== 'all';

  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">Configuratie</p>
          <h1>Documenttypes</h1>
          <p className="page-description">Leer, test en beheer de documenttypes van je klanten.</p>
        </div>
        <button className="primary-button" onClick={onAdd}>
          <Plus size={18} /> Nieuw documenttype
        </button>
      </section>

      <section className="metrics-grid" aria-label="Overzicht documenttypes">
        <Metric icon={FileText} label="Documenttypes" value={types.length} note="In je werkruimte" />
        <Metric icon={Building2} label="Klanten" value={organizations.length} note="Met documenttypes" tone="blue" />
        <Metric icon={Files} label="Voorbeelden" value={totalExamples} note="Geüploade documenten" tone="amber" />
        <Metric icon={Sparkles} label="Live" value={liveCount} note="Automatisch verwerkt" tone="green" />
      </section>

      <section className="filter-panel">
        <FolderBar
          types={types}
          folders={folders}
          folderFilter={folderFilter}
          activeFolder={activeFolder}
          creatingFolder={creatingFolder}
          newFolderName={newFolderName}
          itemLabel="Documenttypes"
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

        <div className="filter-panel-row">
          <div className="search-field">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Zoek op klant, leverancier of type..."
            />
            {search && (
              <button onClick={() => setSearch('')} aria-label="Zoekopdracht wissen">
                <X size={15} />
              </button>
            )}
          </div>
          {organizations.length > 0 && (
            <select
              className="filter-select"
              value={organizationFilter === 'all' ? 'all' : String(organizationFilter)}
              onChange={(event) =>
                setOrganizationFilter(event.target.value === 'all' ? 'all' : Number(event.target.value))
              }
              aria-label="Filter op klant"
            >
              <option value="all">Alle klanten</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          )}
          <select
            className="filter-select"
            value={fileKindFilter}
            onChange={(event) => setFileKindFilter(event.target.value as 'all' | FileKind)}
            aria-label="Filter op bestandstype"
          >
            <option value="all">Alle bestandstypes</option>
            {(['pdf', 'jpg', 'png', 'other'] as FileKind[])
              .filter((kind) => fileKindCounts[kind] > 0)
              .map((kind) => (
                <option key={kind} value={kind}>
                  {FILE_KIND_LABEL[kind]} ({fileKindCounts[kind]})
                </option>
              ))}
          </select>
          <span className="result-count">
            {filteredTypes.length} van {types.length} documenttypes
          </span>
          {filtersActive && (
            <button
              type="button"
              className="text-button filter-reset"
              onClick={() => {
                setSearch('');
                setOrganizationFilter('all');
                setFileKindFilter('all');
                setFolderFilter('all');
              }}
            >
              <X size={13} /> Filters wissen
            </button>
          )}
        </div>
      </section>

      <section className="type-grid type-grid-compact">
        {filteredTypes.map((item) => {
          const FileKindIcon = FILE_KIND_ICON[fileKindOf(item)];
          return (
            <article className="type-card type-card-compact" key={item.id}>
              <div className="type-card-head">
                <span className="customer-logo">{(item.organizationName ?? item.provider).slice(0, 1).toUpperCase()}</span>
                <div className="type-card-heading">
                  <h2>
                    <button
                      type="button"
                      className="type-card-title"
                      onClick={() => onView(item)}
                      title={`${item.name} openen`}
                    >
                      {item.name}
                    </button>
                  </h2>
                  <p>
                    {item.organizationName ?? 'Intern'} · {item.provider}
                  </p>
                </div>
                <StatusPill tone={toneFor(item.status)}>{item.status}</StatusPill>
              </div>

              <div className="type-card-tags">
                <span className="field-chip">
                  <FileKindIcon size={12} /> {FILE_KIND_LABEL[fileKindOf(item)]}
                </span>
                {item.folderName && (
                  <span className="field-chip">
                    <FolderIcon size={12} /> {item.folderName}
                  </span>
                )}
              </div>

              <div className="type-card-facts">
                <span>
                  <Files size={13} /> {item.examples} {item.examples === 1 ? 'voorbeeld' : 'voorbeelden'}
                </span>
                <span>
                  <ListChecks size={13} /> {item.fieldList.length} {item.fieldList.length === 1 ? 'veld' : 'velden'}
                </span>
              </div>

              <div className="type-card-footer">
                <button className="text-button" onClick={() => onView(item)}>
                  Openen <ChevronRight size={15} />
                </button>
                <div className="type-card-icons">
                  <button className="row-action" onClick={() => onEdit(item)} aria-label={`Bewerk ${item.name}`} title="Bewerken">
                    <Pencil size={15} />
                  </button>
                  <button
                    className="row-action row-action-danger"
                    onClick={() => onDelete(item.id)}
                    aria-label={`Verwijder ${item.name}`}
                    title="Verwijderen"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}

        {filteredTypes.length === 0 && (
          <div className="empty-state">
            <Search size={22} />
            <strong>Geen documenttypes gevonden</strong>
            <span>Probeer een andere zoekopdracht of filter.</span>
          </div>
        )}
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
