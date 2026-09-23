import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Building2,
  FileCheck2,
  FileText,
  Files,
  ImagePlus,
  KeyRound,
  Loader2,
  Pencil,
  Search,
  Settings,
  Trash2,
  UserRound,
} from 'lucide-react';
import { Metric } from '../components/Metric';
import { ApiError } from '../api/client';
import { deleteMyLogo, logoUrl, updateMyOrganization, uploadMyLogo } from '../api/organizations';
import type { DocumentType, Organization, OrganizationDetails, RequestStatus } from '../types';

interface MyOrganizationPageProps {
  organization: Organization | null;
  loading: boolean;
  types: DocumentType[];
  onUpdated: (organization: Organization) => void;
  onOpenSettings: () => void;
}

const IN_PROGRESS: RequestStatus[] = ['In beoordeling', 'Inleren', 'Testen', 'Correctie nodig'];

const COMPANY_FIELDS: { key: keyof OrganizationDetails; label: string; placeholder: string; wide?: boolean }[] = [
  { key: 'address', label: 'Adres', placeholder: 'Straat en huisnummer', wide: true },
  { key: 'postalCode', label: 'Postcode', placeholder: '1234 AB' },
  { key: 'city', label: 'Plaats', placeholder: 'Amsterdam' },
  { key: 'kvkNumber', label: 'KvK-nummer', placeholder: '12345678' },
  { key: 'vatNumber', label: 'Btw-nummer', placeholder: 'NL123456789B01' },
  { key: 'website', label: 'Website', placeholder: 'www.bedrijf.nl', wide: true },
];

const CONTACT_FIELDS: { key: keyof OrganizationDetails; label: string; placeholder: string; type?: string }[] = [
  { key: 'contactName', label: 'Naam', placeholder: 'Voor- en achternaam' },
  { key: 'contactEmail', label: 'E-mailadres', placeholder: 'naam@bedrijf.nl', type: 'email' },
  { key: 'contactPhone', label: 'Telefoonnummer', placeholder: '06 12345678', type: 'tel' },
];

function detailsOf(organization: Organization): Record<keyof OrganizationDetails, string> {
  return {
    address: organization.address ?? '',
    postalCode: organization.postalCode ?? '',
    city: organization.city ?? '',
    kvkNumber: organization.kvkNumber ?? '',
    vatNumber: organization.vatNumber ?? '',
    website: organization.website ?? '',
    contactName: organization.contactName ?? '',
    contactEmail: organization.contactEmail ?? '',
    contactPhone: organization.contactPhone ?? '',
  };
}

const MAX_LOGO_BYTES = 2 * 1024 * 1024;

export function MyOrganizationPage({ organization, loading, types, onUpdated, onOpenSettings }: MyOrganizationPageProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<keyof OrganizationDetails, string> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [logoBusy, setLogoBusy] = useState(false);
  const [logoError, setLogoError] = useState('');
  const logoInputRef = useRef<HTMLInputElement>(null);

  if (loading) {
    return (
      <p className="hint-text org-loading">
        <Loader2 size={14} className="spin" /> Organisatiegegevens laden...
      </p>
    );
  }
  if (!organization) {
    return <p className="hint-text">Er is geen organisatie gekoppeld aan dit account.</p>;
  }

  const current = organization;
  const currentLogo = logoUrl(current);
  const values = form ?? detailsOf(current);
  const inProgress = types.filter((type) => IN_PROGRESS.includes(type.status)).length;
  const live = types.filter((type) => type.status === 'Live').length;
  const examples = types.reduce((sum, type) => sum + type.examples, 0);
  const contactMissing = !current.contactName && !current.contactEmail && !current.contactPhone;
  const customerSince = new Date(current.createdAt).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  async function handleLogoSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setLogoError('');
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setLogoError('Kies een PNG-, JPG- of WebP-afbeelding.');
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setLogoError('Het logo mag maximaal 2 MB zijn.');
      return;
    }
    setLogoBusy(true);
    try {
      onUpdated(await uploadMyLogo(file));
    } catch (err) {
      setLogoError(err instanceof ApiError ? err.message : 'Logo uploaden is niet gelukt.');
    } finally {
      setLogoBusy(false);
    }
  }

  async function handleLogoRemove() {
    if (!window.confirm('Het logo verwijderen?')) return;
    setLogoBusy(true);
    setLogoError('');
    try {
      onUpdated(await deleteMyLogo());
    } catch (err) {
      setLogoError(err instanceof ApiError ? err.message : 'Logo verwijderen is niet gelukt.');
    } finally {
      setLogoBusy(false);
    }
  }

  function startEditing() {
    setForm(detailsOf(current));
    setEditing(true);
    setError('');
  }

  function cancelEditing() {
    setForm(null);
    setEditing(false);
    setError('');
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setError('');
    try {
      const updated = await updateMyOrganization(form);
      onUpdated(updated);
      setForm(null);
      setEditing(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Opslaan is niet gelukt. Probeer het opnieuw.');
    } finally {
      setSaving(false);
    }
  }

  function renderField(field: { key: keyof OrganizationDetails; label: string; placeholder: string; type?: string; wide?: boolean }) {
    const value = values[field.key];
    return (
      <div className={`org-field ${field.wide ? 'wide' : ''}`} key={field.key}>
        {editing ? (
          <label>
            {field.label}
            <input
              type={field.type ?? 'text'}
              value={value}
              placeholder={field.placeholder}
              onChange={(event) =>
                setForm((prev) => ({ ...(prev ?? detailsOf(current)), [field.key]: event.target.value }))
              }
            />
          </label>
        ) : (
          <>
            <span>{field.label}</span>
            <strong className={value ? '' : 'empty'}>{value || 'Niet ingevuld'}</strong>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">Klantportaal</p>
          <h1>Mijn organisatie</h1>
          <p className="page-description">Het profiel van je organisatie en de voortgang van je documenttypes.</p>
        </div>
      </section>

      <section className="org-hero">
        <button
          type="button"
          className={`org-logo ${currentLogo ? 'has-logo' : ''}`}
          onClick={() => logoInputRef.current?.click()}
          disabled={logoBusy}
          title={currentLogo ? 'Logo wijzigen' : 'Logo toevoegen'}
          aria-label={currentLogo ? 'Logo wijzigen' : 'Logo toevoegen'}
        >
          {currentLogo ? (
            <img src={currentLogo} alt={`Logo van ${current.name}`} />
          ) : (
            <ImagePlus size={22} aria-hidden="true" />
          )}
        </button>
        <div className="org-hero-copy">
          <h2>{current.name}</h2>
          <p>Klant sinds {customerSince}</p>
          <div className="org-logo-actions">
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              style={{ display: 'none' }}
              onChange={handleLogoSelected}
            />
            <button
              type="button"
              className="text-button"
              onClick={() => logoInputRef.current?.click()}
              disabled={logoBusy}
            >
              <ImagePlus size={14} /> {logoBusy ? 'Bezig...' : currentLogo ? 'Logo wijzigen' : 'Logo toevoegen'}
            </button>
            {currentLogo && (
              <button type="button" className="text-button org-logo-remove" onClick={handleLogoRemove} disabled={logoBusy}>
                <Trash2 size={14} /> Verwijderen
              </button>
            )}
          </div>
          {logoError && <p className="form-error">{logoError}</p>}
        </div>
        <span className="status-pill status-green">
          <span className="status-dot" />
          Actief
        </span>
      </section>

      <section className="metrics-grid" aria-label="Documenttypes van je organisatie">
        <Metric icon={FileText} label="Documenttypes" value={types.length} note="Aangeleverd bij EasyPilot" />
        <Metric icon={Search} label="In behandeling" value={inProgress} note="Beoordelen t/m testen" tone="blue" />
        <Metric icon={FileCheck2} label="Live" value={live} note="Automatisch verwerkt" tone="green" />
        <Metric icon={Files} label="Voorbeelden" value={examples} note="Geüploade documenten" tone="amber" />
      </section>

      <form className="table-section" onSubmit={handleSave}>
        <div className="section-title">
          <div>
            <p className="eyebrow">Profiel</p>
            <h2>Organisatiegegevens</h2>
          </div>
          {!editing && (
            <button type="button" className="secondary-button" onClick={startEditing}>
              <Pencil size={15} /> Gegevens bewerken
            </button>
          )}
        </div>

        {!editing && contactMissing && (
          <div className="info-callout org-callout">
            <div>
              <strong>Vul je contactgegevens aan</strong>
              <p>Dan weet ons team wie we kunnen bereiken met vragen over je documenten.</p>
            </div>
            <button type="button" className="secondary-button" onClick={startEditing}>
              Aanvullen
            </button>
          </div>
        )}

        <div className="org-grid">
          <div className="org-card">
            <h3>
              <Building2 size={16} /> Bedrijfsgegevens
            </h3>
            <div className="org-fields">
              <div className="org-field wide">
                <span>Bedrijfsnaam</span>
                <strong>{current.name}</strong>
                {editing && <small>Wil je de bedrijfsnaam wijzigen? Neem contact op met support.</small>}
              </div>
              {COMPANY_FIELDS.map(renderField)}
            </div>
          </div>

          <div className="org-card">
            <h3>
              <UserRound size={16} /> Contactpersoon
            </h3>
            <div className="org-fields single">{CONTACT_FIELDS.map(renderField)}</div>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}
        {editing && (
          <div className="org-actions">
            <button type="button" className="secondary-button" onClick={cancelEditing} disabled={saving}>
              Annuleren
            </button>
            <button type="submit" className="primary-button" disabled={saving}>
              {saving ? 'Bezig...' : 'Gegevens opslaan'}
            </button>
          </div>
        )}
      </form>

      <section className="settings-card settings-bar org-account">
        <div className="settings-bar-row">
          <span className="settings-bar-icon">
            <KeyRound size={20} />
          </span>
          <div className="settings-bar-copy">
            <div className="settings-bar-title">
              <h2>Inloggegevens</h2>
            </div>
            <p className="settings-card-description">
              Je logt in als <strong>{current.customerUsername ?? '—'}</strong>. Je wachtwoord en tweestapsverificatie
              beheer je onder Instellingen.
            </p>
          </div>
          <button type="button" className="secondary-button settings-bar-action" onClick={onOpenSettings}>
            <Settings size={15} /> Naar instellingen
          </button>
        </div>
      </section>
    </>
  );
}
