import { useMemo, useState } from 'react';
import { ChevronRight, File, FileImage, FileText, Folder as FolderIcon, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
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

      <section className="table-section" style={{ marginTop: 0 }}>
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

        <div className="status-tabs" role="tablist" aria-label="Bestandstype">
          <button
            type="button"
            className={`status-tab ${fileKindFilter === 'all' ? 'active' : ''}`}
            onClick={() => setFileKindFilter('all')}
          >
            Alle bestanden <span>{types.length}</span>
          </button>
          {(['pdf', 'jpg', 'png', 'other'] as FileKind[])
            .filter((kind) => fileKindCounts[kind] > 0)
            .map((kind) => (
              <button
                key={kind}
                type="button"
                className={`status-tab ${fileKindFilter === kind ? 'active' : ''}`}
                onClick={() => setFileKindFilter(kind)}
              >
                {FILE_KIND_LABEL[kind]} <span>{fileKindCounts[kind]}</span>
              </button>
            ))}
        </div>

        <div className="table-toolbar">
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
          <span className="result-count">
            {filteredTypes.length} van {types.length} documenttypes
          </span>
        </div>
      </section>

      <section className="type-grid">
        {filteredTypes.map((item) => {
          const FileKindIcon = FILE_KIND_ICON[fileKindOf(item)];
          return (
            <article className="type-card" key={item.id}>
              <div className="type-card-top">
                <span className="customer-logo">{item.provider[0]}</span>
                <StatusPill tone={toneFor(item.status)}>{item.status}</StatusPill>
              </div>
              <h2>
                <button type="button" className="type-card-title" onClick={() => onView(item)} title={`${item.name} openen`}>
                  {item.name}
                </button>
              </h2>
              <p>
                {item.organizationName ?? 'Intern'} · {item.provider}
              </p>
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
              <div className="type-stats">
                <span>
                  <strong>{item.examples}</strong> voorbeelden
                </span>
                <span>
                  <strong>{item.fieldList.length}</strong> velden
                </span>
              </div>
              <div className="type-card-actions">
                <button className="text-button" onClick={() => onView(item)}>
                  Openen <ChevronRight size={16} />
                </button>
                <button className="row-action" onClick={() => onEdit(item)} aria-label={`Bewerk ${item.name}`} title="Bewerken">
                  <Pencil size={16} />
                </button>
                <button className="row-action" onClick={() => onDelete(item.id)} aria-label={`Verwijder ${item.name}`} title="Verwijderen">
                  <Trash2 size={16} />
                </button>
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
