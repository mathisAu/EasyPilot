import { useEffect, useState } from 'react';
import { Check, Download, FileText, Loader2, RefreshCw, Save, X } from 'lucide-react';
import {
  getExtractedFields,
  listDocuments,
  previewUrl,
  redactedUrl,
  retryExtraction,
  summaryUrl,
  updateDocumentTypeStatus,
  updateExtractedFields,
} from '../api/documentTypes';
import { ApiError } from '../api/client';
import { STAGE_ORDER, toneFor } from '../data';
import { StatusPill } from '../components/StatusPill';
import type { DocumentFile, DocumentType, ExtractedField, RequestStatus } from '../types';

interface DocumentReviewModalProps {
  documentType: DocumentType;
  onClose: () => void;
  onStatusChanged: (updated: DocumentType) => void;
  onFieldsSaved: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function DocumentReviewModal({ documentType, onClose, onStatusChanged, onFieldsSaved }: DocumentReviewModalProps) {
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

  const selectedDoc = documents.find((doc) => doc.id === selectedDocId) ?? null;

  useEffect(() => {
    setLoading(true);
    listDocuments(documentType.id)
      .then((result) => {
        setDocuments(result);
        setSelectedDocId((current) => {
          if (current !== null && result.some((doc) => doc.id === current)) return current;
          return result.length > 0 ? result[0].id : null;
        });
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Kon documenten niet laden.'))
      .finally(() => setLoading(false));
  }, [documentType.id]);

  useEffect(() => {
    setStatus(documentType.status);
  }, [documentType.status]);

  // Poll while extraction is still running so "bezig" resolves into the real
  // result on its own, instead of leaving a stale state until the modal is reopened.
  useEffect(() => {
    if (!selectedDoc) return;
    if (selectedDoc.extractionStatus !== 'PENDING' && selectedDoc.extractionStatus !== 'IN_PROGRESS') return;
    const interval = window.setInterval(() => {
      listDocuments(documentType.id).then(setDocuments).catch(() => {});
    }, 3000);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentType.id, selectedDocId, selectedDoc?.extractionStatus]);

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
          initialConfirmed[field.fieldName] = field.included;
        });
        setValues(initial);
        setConfirmed(initialConfirmed);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Kon uitgelezen velden niet laden.'))
      .finally(() => setLoadingFields(false));
    // Also refetch once extraction finishes (status flips from IN_PROGRESS/PENDING to DONE/FAILED).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDocId, selectedDoc?.extractionStatus]);

  async function handleSaveFields() {
    if (selectedDocId === null) return;
    setSavingFields(true);
    setError('');
    try {
      const payload = fields.map((field) => ({
        fieldName: field.fieldName,
        value: values[field.fieldName] ?? '',
        included: confirmed[field.fieldName] ?? true,
      }));
      const updated = await updateExtractedFields(selectedDocId, payload);
      setFields(updated);
      onFieldsSaved();
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

  const fileKind = selectedDoc?.contentType.startsWith('image/') ? 'afbeelding' : 'PDF';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal review-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Sluiten">
          <X size={18} />
        </button>
        <div className="review-header">
          <div>
            <p className="eyebrow">{documentType.provider}</p>
            <h2>{documentType.name}</h2>
            <p className="modal-description">Document inleren en beoordelen</p>
          </div>
          <StatusPill tone={toneFor(documentType.status)}>{documentType.status}</StatusPill>
        </div>

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

        {loading && (
          <p className="modal-description review-loading">
            <Loader2 size={14} className="spin" /> Bezig met laden...
          </p>
        )}

        {!loading && selectedDoc && (
          <div className="review-layout">
            <div className="review-card review-preview-card">
              <div className="review-card-header">
                <span>
                  <FileText size={14} /> Origineel document ({fileKind})
                </span>
                <a href={previewUrl(selectedDoc.id)} target="_blank" rel="noreferrer" title="Downloaden" aria-label="Document downloaden">
                  <Download size={14} />
                </a>
              </div>
              <div className="review-preview">
                {selectedDoc.contentType.startsWith('image/') ? (
                  <img src={previewUrl(selectedDoc.id)} alt={selectedDoc.filename} />
                ) : (
                  // The fragment suppresses the browser PDF viewer's own dark toolbar
                  // and thumbnail sidebar, which otherwise clash with the app's design.
                  <embed
                    src={`${previewUrl(selectedDoc.id)}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                    type={selectedDoc.contentType}
                  />
                )}
              </div>
              <div className="review-card-footer">
                <span className="file-name">{selectedDoc.filename}</span>
                <span className="file-size">{formatFileSize(selectedDoc.sizeBytes)}</span>
              </div>
            </div>

            <div className="review-card review-fields-card">
              <div className="review-card-header">
                <span>Uitgelezen gegevens</span>
                {selectedDoc.extractionStatus === 'DONE' && (
                  <span className="extraction-done-badge">
                    <Check size={12} /> Uitgelezen
                  </span>
                )}
              </div>

              <div className="review-fields">
                {selectedDoc.extractionStatus === 'IN_PROGRESS' && (
                  <p className="modal-description review-loading">
                    <Loader2 size={14} className="spin" /> Extractie is bezig...
                  </p>
                )}
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
                          aria-label={`${field.fieldName} ${confirmed[field.fieldName] ? 'wordt opgenomen in de samenvatting' : 'wordt weggelaten uit de samenvatting'}`}
                          title="Opnemen in de samenvatting (uitvinken sluit dit veld uit bij downloaden)"
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    ))}
                    <div className="review-save-row">
                      <button type="button" className="primary-button review-save-button" onClick={handleSaveFields} disabled={savingFields}>
                        <Save size={16} /> {savingFields ? 'Bezig...' : 'Opslaan'}
                      </button>
                      {selectedDoc.extractionStatus === 'DONE' && (
                        <a
                          href={summaryUrl(selectedDoc.id)}
                          target="_blank"
                          rel="noreferrer"
                          className="secondary-button review-summary-link"
                          title="Downloadt een los PDF-bestand met alleen de opgeslagen, ingevulde velden"
                        >
                          <Download size={14} /> Samenvatting downloaden
                        </a>
                      )}
                    </div>
                    <p className="modal-description review-summary-hint">
                      De samenvatting bevat alleen de aangevinkte, opgeslagen velden. Sla eerst op voordat je downloadt.
                    </p>

                    {selectedDoc.extractionStatus === 'DONE' && (
                      <>
                        {fields.some((field) => field.hasLocation) ? (
                          <>
                            <a
                              href={redactedUrl(selectedDoc.id)}
                              target="_blank"
                              rel="noreferrer"
                              className="secondary-button review-redacted-link"
                              title="Downloadt het originele document met de opgeslagen wijzigingen erin verwerkt"
                            >
                              <Download size={14} /> Aangepast document downloaden
                            </a>
                            <p className="modal-description review-summary-hint">
                              Dit is het originele bestand zelf: uitgevinkte of gewijzigde velden worden op hun
                              plek overschilderd. Niet elk veld is altijd gevonden — controleer het resultaat.
                            </p>
                          </>
                        ) : (
                          <div className="info-callout">
                            <div>
                              <strong>Posities nog niet bekend</strong>
                              <p>
                                Dit document is uitgelezen vóór deze functie bestond. Lees het opnieuw uit om het
                                originele bestand met wijzigingen te kunnen downloaden.
                              </p>
                            </div>
                            <button type="button" className="secondary-button" onClick={handleRetryExtraction} disabled={retrying}>
                              <RefreshCw size={14} /> {retrying ? 'Bezig...' : 'Opnieuw uitlezen'}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}

                {!loadingFields && fields.length === 0 && selectedDoc.extractionStatus === 'DONE' && (
                  <p className="modal-description">Geen velden gevonden.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {!loading && documents.length === 0 && <p className="modal-description">Nog geen documenten geüpload.</p>}

        <div className="review-status-footer">
          <div>
            <strong>Status van dit documenttype</strong>
            <small>Verplaats de aanvraag naar de volgende fase van de workflow.</small>
          </div>
          <div className="review-status-controls">
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
    </div>
  );
}
