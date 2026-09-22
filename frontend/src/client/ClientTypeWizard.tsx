import { useMemo, useState } from 'react';
import { ChevronRight, FileCheck2, FileText, Loader2, Plus, Sparkles, Upload, X } from 'lucide-react';
import { Toggle } from '../components/Toggle';
import { DEFAULT_SELECTED_FIELDS, STANDARD_FIELDS } from '../data';
import { createDocumentType, uploadDocument } from '../api/documentTypes';
import { ApiError } from '../api/client';
import type { DocumentType } from '../types';

const TOTAL_STEPS = 4;
const STEP_LABELS = ['Basisgegevens', 'Voorbeelden', 'Gewenste velden', 'Verzenden'];

interface ClientTypeWizardProps {
  onClose: () => void;
  onSubmitted: (type: DocumentType) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function ClientTypeWizard({ onClose, onSubmitted }: ClientTypeWizardProps) {
  const [step, setStep] = useState(1);
  const [provider, setProvider] = useState('');
  const [type, setType] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    STANDARD_FIELDS.forEach((field) => {
      initial[field.key] = DEFAULT_SELECTED_FIELDS.has(field.key);
    });
    return initial;
  });
  const [customFields, setCustomFields] = useState<string[]>([]);
  const [customFieldDraft, setCustomFieldDraft] = useState('');
  const [showCustomFieldInput, setShowCustomFieldInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedFieldLabels = useMemo(() => {
    const standard = STANDARD_FIELDS.filter((field) => selectedFields[field.key]).map((field) => field.label);
    return [...standard, ...customFields];
  }, [selectedFields, customFields]);

  const canContinue =
    step === 1
      ? provider.trim().length > 0 && type.trim().length > 0
      : step === 2
        ? files.length >= 1
        : step === 3
          ? selectedFieldLabels.length > 0
          : true;

  function addFiles(newFiles: FileList | null) {
    if (!newFiles) return;
    const snapshot = Array.from(newFiles);
    setFiles((current) => [...current, ...snapshot]);
  }

  function removeFile(index: number) {
    setFiles((current) => current.filter((_, i) => i !== index));
  }

  function toggleField(key: string, checked: boolean) {
    setSelectedFields((current) => ({ ...current, [key]: checked }));
  }

  function confirmCustomField() {
    const label = customFieldDraft.trim();
    if (label) {
      setCustomFields((current) => [...current, label]);
    }
    setCustomFieldDraft('');
    setShowCustomFieldInput(false);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const created = await createDocumentType({
        name: type.trim(),
        provider: provider.trim(),
        status: 'Aangeleverd',
        fields: selectedFieldLabels,
      });
      await Promise.all(files.map((file) => uploadDocument(created.id, file)));
      onSubmitted({ ...created, examples: files.length });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Aanleveren is niet gelukt. Probeer het opnieuw.');
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={submitting ? undefined : onClose}>
      <div className="modal request-modal" onClick={(event) => event.stopPropagation()}>
        {!submitting && (
          <button type="button" className="modal-close" onClick={onClose} aria-label="Sluiten">
            <X size={18} />
          </button>
        )}

        <p className="eyebrow">
          Nieuw documenttype aanleveren · stap {step} van {TOTAL_STEPS}
        </p>

        <div className="stepper stepper-numbered">
          {STEP_LABELS.map((label, index) => {
            const stepNumber = index + 1;
            const state = stepNumber === step ? 'active' : stepNumber < step ? 'done' : '';
            return (
              <span key={label} className={state}>
                <span className="stepper-dot">{stepNumber < step ? <FileCheck2 size={12} /> : stepNumber}</span>
                {label}
              </span>
            );
          })}
        </div>

        {step === 1 && (
          <div className="wizard-step">
            <h2>Nieuw documenttype aanleveren</h2>
            <p className="modal-description">Begin met de gegevens van het document dat EasyPilot moet leren.</p>
            <label>
              Van wie komen deze documenten?
              <input
                value={provider}
                onChange={(event) => setProvider(event.target.value)}
                placeholder="Bijv. BMN"
                autoFocus
              />
            </label>
            <label>
              Wat voor document is dit?
              <input
                value={type}
                onChange={(event) => setType(event.target.value)}
                placeholder="Bijv. Transportopdracht"
              />
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="wizard-step">
            <h2>Voorbeelden uploaden</h2>
            <p className="modal-description">
              Upload minimaal 1, bij voorkeur 5&ndash;10 verschillende voorbeelden.
            </p>
            <label className="upload-zone" style={{ cursor: 'pointer' }}>
              <Upload size={22} />
              <strong>Sleep bestanden hierheen of klik om te uploaden</strong>
              <small>Ondersteunde formaten: PDF, JPG, PNG</small>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/*"
                style={{ display: 'none' }}
                onChange={(event) => {
                  addFiles(event.target.files);
                  event.target.value = '';
                }}
              />
            </label>
            {files.length > 0 && (
              <ul className="file-list">
                {files.map((file, index) => (
                  <li key={`${file.name}-${index}`}>
                    <FileText size={16} />
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatFileSize(file.size)}</span>
                    <button type="button" onClick={() => removeFile(index)} aria-label={`Verwijder ${file.name}`}>
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="wizard-step">
            <h2>Gewenste velden selecteren</h2>
            <p className="modal-description">Welke gegevens moeten wij uit het document halen?</p>
            <ul className="field-toggle-list">
              {STANDARD_FIELDS.map((field) => (
                <li key={field.key}>
                  <div>
                    <strong>{field.label}</strong>
                    {field.example && <small>{field.example}</small>}
                  </div>
                  <Toggle
                    checked={Boolean(selectedFields[field.key])}
                    onChange={(checked) => toggleField(field.key, checked)}
                    label={field.label}
                  />
                </li>
              ))}
              {customFields.map((label) => (
                <li key={label}>
                  <div>
                    <strong>{label}</strong>
                    <small>Eigen veld</small>
                  </div>
                  <Toggle checked onChange={() => setCustomFields((current) => current.filter((item) => item !== label))} label={label} />
                </li>
              ))}
            </ul>
            {showCustomFieldInput ? (
              <div className="custom-field-input">
                <input
                  value={customFieldDraft}
                  onChange={(event) => setCustomFieldDraft(event.target.value)}
                  placeholder="Naam van het veld"
                  autoFocus
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      confirmCustomField();
                    }
                  }}
                />
                <button type="button" className="secondary-button" onClick={confirmCustomField}>
                  Toevoegen
                </button>
              </div>
            ) : (
              <button type="button" className="add-field-button" onClick={() => setShowCustomFieldInput(true)}>
                <Plus size={15} /> Eigen veld toevoegen
              </button>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="wizard-step">
            <h2>Bevestigen en verzenden</h2>
            <p className="modal-description">Controleer je aanvraag en verzend.</p>
            <div className="summary-card">
              <div>
                <span>Van</span>
                <strong>{provider}</strong>
              </div>
              <div>
                <span>Documenttype</span>
                <strong>{type}</strong>
              </div>
              <div>
                <span>Aantal voorbeelden</span>
                <strong>{files.length} documenten</strong>
              </div>
              <div>
                <span>Gewenste velden</span>
                <strong>{selectedFieldLabels.length} velden</strong>
              </div>
            </div>
            <div className="info-callout">
              <span className="info-callout-icon">
                <Sparkles size={16} />
              </span>
              <div>
                <strong>Wij gaan voor je aan de slag!</strong>
                <p>Je ontvangt bericht zodra het documenttype is ingeleerd en getest.</p>
              </div>
            </div>
            {error && <p className="form-error">{error}</p>}
          </div>
        )}

        <div className="modal-actions">
          {!submitting && (
            <button type="button" className="secondary-button" onClick={step === 1 ? onClose : () => setStep(step - 1)}>
              {step === 1 ? 'Annuleren' : 'Vorige'}
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button type="button" className="primary-button" disabled={!canContinue} onClick={() => setStep(step + 1)}>
              Volgende <ChevronRight size={16} />
            </button>
          ) : (
            <button type="button" className="submit-button" disabled={submitting} onClick={handleSubmit}>
              {submitting ? (
                <>
                  <Loader2 size={16} className="spin" /> Bezig met verzenden...
                </>
              ) : (
                <>
                  Aanvraag verzenden <FileCheck2 size={16} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
