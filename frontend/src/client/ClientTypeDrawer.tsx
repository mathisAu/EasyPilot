import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { FileText, Upload } from 'lucide-react';
import { Drawer } from '../components/Drawer';
import { StatusPill } from '../components/StatusPill';
import { downloadUrl, listDocuments, uploadDocument } from '../api/documentTypes';
import { ApiError } from '../api/client';
import type { DocumentFile, DocumentType } from '../types';

interface ClientTypeDrawerProps {
  documentType: DocumentType;
  onClose: () => void;
  onDocumentCountChange: (typeId: number, count: number) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function ClientTypeDrawer({ documentType, onClose, onDocumentCountChange }: ClientTypeDrawerProps) {
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [docsError, setDocsError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadingDocs(true);
    listDocuments(documentType.id)
      .then((result) => {
        if (!cancelled) setDocuments(result);
      })
      .catch((err) => {
        if (!cancelled) setDocsError(err instanceof ApiError ? err.message : 'Kon documenten niet laden.');
      })
      .finally(() => {
        if (!cancelled) setLoadingDocs(false);
      });
    return () => {
      cancelled = true;
    };
  }, [documentType.id]);

  async function handleFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length === 0) return;

    setUploading(true);
    setDocsError('');
    try {
      const uploaded = await Promise.all(files.map((file) => uploadDocument(documentType.id, file)));
      setDocuments((current) => {
        const next = [...uploaded, ...current];
        onDocumentCountChange(documentType.id, next.length);
        return next;
      });
    } catch (err) {
      setDocsError(err instanceof ApiError ? err.message : 'Uploaden is niet gelukt.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <Drawer title={documentType.name} eyebrow={documentType.provider} onClose={onClose}>
      <div className="drawer-summary">
        <div>
          <span>Voorbeelden</span>
          <strong>{documentType.examples} documenten</strong>
        </div>
        <div>
          <span>Velden</span>
          <strong>{documentType.fieldList.length} velden</strong>
        </div>
        <div>
          <span>Status</span>
          <StatusPill tone={documentType.live ? 'green' : 'amber'}>
            {documentType.live ? 'Live' : 'Wordt ingeleerd'}
          </StatusPill>
        </div>
      </div>

      <h3 className="drawer-subheading">Gewenste velden</h3>
      <div className="field-chip-list">
        {documentType.fieldList.map((field) => (
          <span className="field-chip" key={field}>
            {field}
          </span>
        ))}
      </div>

      <h3 className="drawer-subheading">Documenten</h3>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/*"
        style={{ display: 'none' }}
        onChange={handleFilesSelected}
      />
      <button
        type="button"
        className="upload-zone"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        <Upload size={22} />
        <strong>{uploading ? 'Bezig met uploaden...' : 'Klik om extra voorbeelden te uploaden'}</strong>
        <small>Ondersteunde formaten: PDF, JPG, PNG</small>
      </button>

      {docsError && <p className="form-error">{docsError}</p>}

      {!loadingDocs && documents.length > 0 && (
        <ul className="file-list">
          {documents.map((doc) => (
            <li key={doc.id}>
              <FileText size={16} />
              <a className="file-name" href={downloadUrl(doc.id)} target="_blank" rel="noreferrer">
                {doc.filename}
              </a>
              <span className="file-size">{formatFileSize(doc.sizeBytes)}</span>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  );
}
