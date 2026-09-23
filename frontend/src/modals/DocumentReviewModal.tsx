import { useEffect, useState } from 'react';
import { Check, RefreshCw, Save, X } from 'lucide-react';
import {
  getExtractedFields,
  listDocuments,
  previewUrl,
  retryExtraction,
  updateDocumentTypeStatus,
  updateExtractedFields,
} from '../api/documentTypes';
import { ApiError } from '../api/client';
import { STAGE_ORDER } from '../data';
import type { DocumentFile, DocumentType, ExtractedField, RequestStatus } from '../types';

interface DocumentReviewModalProps {
  documentType: DocumentType;
  onClose: () => void;
  onStatusChanged: (updated: DocumentType) => void;
}

export function DocumentReviewModal({ documentType, onClose, onStatusChanged }: DocumentReviewModalProps) {
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [fields, setFields] = useState<ExtractedField[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [loadingFields, setLoadingFields] = useState(false);
  const [savingFields, setSavingFields] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [status, setStatus] = useState<RequestStatus>(documentType.status);
  const [savingStatus, setSavingStatus] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    listDocuments(documentType.id)
      .then((result) => {
        setDocuments(result);
        if (result.length > 0) setSelectedDocId(result[0].id);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Kon documenten niet laden.'))
      .finally(() => setLoading(false));
  }, [documentType.id]);

  useEffect(() => {
    if (selectedDocId === null) return;
    setLoadingFields(true);
    getExtractedFields(selectedDocId)
      .then((result) => {
        setFields(result);
        const initial: Record<string, string> = {};
        const initialConfirmed: Record<string, boolean> = {};
        result.forEach((field) => {
          initial[field.fieldName] = field.value ?? '';
          initialConfirmed[field.fieldName] = Boolean(field.value && field.value.trim().length > 0);
        });
        setValues(initial);
        setConfirmed(initialConfirmed);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Kon uitgelezen velden niet laden.'))
      .finally(() => setLoadingFields(false));
  }, [selectedDocId]);

  const selectedDoc = documents.find((doc) => doc.id === selectedDocId) ?? null;

  async function handleSaveFields() {
    if (selectedDocId === null) return;
    setSavingFields(true);
    setError('');
    try {
      const payload = fields.map((field) => ({ fieldName: field.fieldName, value: values[field.fieldName] ?? '' }));
      const updated = await updateExtractedFields(selectedDocId, payload);
      setFields(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Opslaan is niet gelukt.');
    } finally {
      setSavingFields(false);
    }
  }

  async function handleRetryExtraction() {
    if (selectedDocId === null) return;
    setRetrying(true);
    setError('');
    try {
      await retryExtraction(selectedDocId);
      setDocuments((current) =>
        current.map((doc) => (doc.id === selectedDocId ? { ...doc, extractionStatus: 'IN_PROGRESS' } : doc))
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Opnieuw proberen is niet gelukt.');
    } finally {
      setRetrying(false);
    }
  }

  async function handleUpdateStatus() {
    setSavingStatus(true);
    setError('');
    try {
      const updated = await updateDocumentTypeStatus(documentType.id, status);
      onStatusChanged(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Status bijwerken is niet gelukt.');
    } finally {
      setSavingStatus(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal review-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Sluiten">
          <X size={18} />
        </button>
        <p className="eyebrow">{documentType.provider}</p>
        <h2>{documentType.name}</h2>
        <p className="modal-description">Document inleren en beoordelen</p>

        {documents.length > 1 && (
          <div className="custom-field-input">
            <select value={selectedDocId ?? ''} onChange={(event) => setSelectedDocId(Number(event.target.value))}>
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.filename}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && <p className="form-error">{error}</p>}

        {!loading && selectedDoc && (
          <div className="review-layout">
            <div className="review-preview">
              {selectedDoc.contentType.startsWith('image/') ? (
                <img src={previewUrl(selectedDoc.id)} alt={selectedDoc.filename} />
              ) : (
                <embed src={previewUrl(selectedDoc.id)} type={selectedDoc.contentType} />
              )}
            </div>

            <div className="review-fields">
              <h3 className="drawer-subheading">Uitgelezen gegevens</h3>

              {selectedDoc.extractionStatus === 'IN_PROGRESS' && <p className="modal-description">Extractie is bezig...</p>}
              {selectedDoc.extractionStatus === 'FAILED' && (
                <div className="info-callout">
                  <div>
                    <strong>Extractie mislukt</strong>
                    <p>{selectedDoc.extractionError ?? 'Onbekende fout'}</p>
                  </div>
                  <button type="button" className="secondary-button" onClick={handleRetryExtraction} disabled={retrying}>
                    <RefreshCw size={14} /> {retrying ? 'Bezig...' : 'Opnieuw proberen'}
                  </button>
                </div>
              )}

              {!loadingFields && fields.length > 0 && (
                <>
                  {fields.map((field) => (
                    <div className="review-field-row" key={field.fieldName}>
                      <label>
                        {field.fieldName}
                        <input
                          value={values[field.fieldName] ?? ''}
                          onChange={(event) => {
                            const nextValue = event.target.value;
                            setValues((current) => ({ ...current, [field.fieldName]: nextValue }));
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        className={`field-confirm-toggle ${confirmed[field.fieldName] ? 'confirmed' : ''}`}
                        onClick={() =>
                          setConfirmed((current) => ({ ...current, [field.fieldName]: !current[field.fieldName] }))
                        }
                        aria-pressed={Boolean(confirmed[field.fieldName])}
                        aria-label={`${field.fieldName} ${confirmed[field.fieldName] ? 'bevestigd' : 'niet bevestigd'}`}
                        title="Bevestig dit veld"
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  ))}
                  <button type="button" className="primary-button" onClick={handleSaveFields} disabled={savingFields}>
                    <Save size={16} /> {savingFields ? 'Bezig...' : 'Opslaan'}
                  </button>
                </>
              )}

              {!loadingFields && fields.length === 0 && selectedDoc.extractionStatus === 'DONE' && (
                <p className="modal-description">Geen velden gevonden.</p>
              )}

              <h3 className="drawer-subheading">Status</h3>
              <div className="custom-field-input">
                <select value={status} onChange={(event) => setStatus(event.target.value as RequestStatus)}>
                  {STAGE_ORDER.map((label) => (
                    <option key={label} value={label}>
                      {label}
                    </option>
                  ))}
                </select>
                <button type="button" className="secondary-button" onClick={handleUpdateStatus} disabled={savingStatus}>
                  {savingStatus ? 'Bezig...' : 'Status bijwerken'}
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && documents.length === 0 && <p className="modal-description">Nog geen documenten geüpload.</p>}
      </div>
    </div>
  );
}
