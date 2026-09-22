import { useMemo, useState } from 'react';
import { ChevronRight, FileCheck2, FileText, Loader2, Plus, Sparkles, Upload, X } from 'lucide-react';
import { Toggle } from '../components/Toggle';
import { DEFAULT_SELECTED_FIELDS, STANDARD_FIELDS } from '../data';
import type { UploadedFile } from '../types';

const TOTAL_STEPS = 4;
const STEP_LABELS = ['Basisgegevens', 'Voorbeelden', 'Gewenste velden', 'Verzenden'];

export interface RequestWizardResult {
  customer: string;
  provider: string;
  type: string;
  exampleCount: number;
  fields: string[];
}

interface RequestWizardProps {
  onClose: () => void;
  onSubmit: (result: RequestWizardResult) => void;
}

function formatFileSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function RequestWizard({ onClose, onSubmit }: RequestWizardProps) {
  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState('');
  const [provider, setProvider] = useState('');
  const [type, setType] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
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

  const selectedFieldLabels = useMemo(() => {
    const standard = STANDARD_FIELDS.filter((field) => selectedFields[field.key]).map((field) => field.label);
    return [...standard, ...customFields];
  }, [selectedFields, customFields]);

  const canContinue =
    step === 1
      ? customer.trim().length > 0 && provider.trim().length > 0 && type.length > 0
      : step === 2
        ? files.length >= 1
        : step === 3
          ? selectedFieldLabels.length > 0
          : true;

  function addSimulatedFile() {
    const index = files.length + 1;
    setFiles((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: `${provider || 'voorbeeld'}_order_${index}.pdf`,
        sizeLabel: formatFileSize(1_400_000 + Math.random() * 900_000),
      },
    ]);
  }

  function removeFile(id: string) {
    setFiles((current) => current.filter((file) => file.id !== id));
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

  function handleSubmit() {
    setSubmitting(true);
    window.setTimeout(() => {
      onSubmit({
        customer: customer.trim(),
        provider: provider.trim(),
        type,
        exampleCount: files.length,
        fields: selectedFieldLabels,
      });
    }, 700);
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
          Nieuwe workflow · stap {step} van {TOTAL_STEPS}
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
              Opdrachtgever
              <input
                value={customer}
                onChange={(event) => setCustomer(event.target.value)}
                placeholder="Bijv. Zeelte Transport"
                autoFocus
              />
            </label>
            <label>
              Van wie komen deze documenten?
              <input
                value={provider}
                onChange={(event) => setProvider(event.target.value)}
                placeholder="Bijv. BMN"
              />
            </label>
            <label>
              Wat voor document is dit?
              <select value={type} onChange={(event) => setType(event.target.value)}>
                <option value="">Kies een documenttype</option>
                <option>Transportopdracht</option>
                <option>Laadlijst</option>
              </select>
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="wizard-step">
            <h2>Voorbeelden uploaden</h2>
            <p className="modal-description">
              Upload minimaal 3, bij voorkeur 5&ndash;10 verschillende voorbeelden.
            </p>
            <button type="button" className="upload-zone" onClick={addSimulatedFile}>
              <Upload size={22} />
              <strong>Sleep bestanden hierheen of klik om te uploaden</strong>
              <small>Ondersteunde formaten: PDF, JPG, PNG</small>
            </button>
            {files.length > 0 && (
              <ul className="file-list">
                {files.map((file) => (
                  <li key={file.id}>
                    <FileText size={16} />
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{file.sizeLabel}</span>
                    <button type="button" onClick={() => removeFile(file.id)} aria-label={`Verwijder ${file.name}`}>
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
                  onKeyDown={(event) => event.key === 'Enter' && confirmCustomField()}
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
                <span>Opdrachtgever</span>
                <strong>{customer}</strong>
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
                <p>Je ontvangt een melding zodra het documenttype is ingeleerd en getest.</p>
              </div>
            </div>
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
