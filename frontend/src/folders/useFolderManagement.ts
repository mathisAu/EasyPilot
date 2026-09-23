import { useEffect, useMemo, useState } from 'react';
import { createFolder, deleteFolder, listFolders } from '../api/folders';
import { moveDocumentTypeToFolder } from '../api/documentTypes';
import { ApiError } from '../api/client';
import type { DocumentType, Folder } from '../types';

export type FolderFilter = 'all' | 'none' | number;

export function useFolderManagement(types: DocumentType[], onTypeUpdated: (type: DocumentType) => void) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [folderFilter, setFolderFilter] = useState<FolderFilter>('all');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderError, setFolderError] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [showFolders, setShowFolders] = useState(false);
  const [movingType, setMovingType] = useState<DocumentType | null>(null);

  useEffect(() => {
    listFolders()
      .then(setFolders)
      .catch((err) => setFolderError(err instanceof ApiError ? err.message : 'Kon mappen niet laden.'));
  }, []);

  async function handleCreateFolder(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    setFolderError('');
    try {
      const folder = await createFolder(trimmed);
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

  async function handleMoveToFolder(type: DocumentType, target: Folder) {
    setFolderError('');
    setMovingType(null);
    try {
      onTypeUpdated(await moveDocumentTypeToFolder(type.id, target.id));
    } catch (err) {
      setFolderError(err instanceof ApiError ? err.message : 'Verplaatsen is niet gelukt.');
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

  const activeFolder = useMemo(
    () => (typeof folderFilter === 'number' ? folders.find((folder) => folder.id === folderFilter) ?? null : null),
    [folderFilter, folders]
  );

  const matchesFolder = useMemo(
    () => (type: DocumentType) => {
      if (folderFilter === 'all') return true;
      if (folderFilter === 'none') return !type.folderId;
      return type.folderId === folderFilter;
    },
    [folderFilter]
  );

  return {
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
  };
}
