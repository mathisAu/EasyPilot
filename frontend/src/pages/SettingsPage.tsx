import { useState, type FormEvent } from 'react';
import { KeyRound, QrCode, ShieldCheck, ShieldOff, UserRound } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { StatusPill } from '../components/StatusPill';
import type { AuthUser } from '../api/auth';
import * as accountApi from '../api/account';

export function SettingsPage() {
  const { user, updateUser } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">Account</p>
          <h1>Instellingen</h1>
          <p className="page-description">Beheer je profiel, wachtwoord en beveiliging.</p>
        </div>
      </section>

      <div className="settings-grid">
        <ProfileCard displayName={user.displayName} email={user.email} username={user.username} organizationName={user.organizationName} onSaved={updateUser} />
        <PasswordCard />
        <TwoFactorCard totpEnabled={user.totpEnabled} onChanged={updateUser} />
      </div>
    </>
  );
}

interface ProfileCardProps {
  displayName: string | null;
  email: string | null;
  username: string;
  organizationName: string | null;
  onSaved: (user: AuthUser) => void;
}

function ProfileCard({ displayName, email, username, organizationName, onSaved }: ProfileCardProps) {
  const [name, setName] = useState(displayName ?? '');
  const [mail, setMail] = useState(email ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);
    try {
      const updated = await accountApi.updateProfile({ displayName: name.trim(), email: mail.trim() });
      onSaved(updated);
      setSuccess(true);
      window.setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Opslaan is niet gelukt. Probeer het opnieuw.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="settings-card" onSubmit={handleSubmit}>
      <h2>
        <UserRound size={16} style={{ verticalAlign: '-3px', marginRight: 8 }} />
        Profiel
      </h2>
      <p className="settings-card-description">Je naam en e-mailadres, zichtbaar in de werkruimte.</p>

      <label>
        Gebruikersnaam
        <input value={username} disabled />
      </label>
      {organizationName && (
        <label>
          Organisatie
          <input value={organizationName} disabled />
        </label>
      )}
      <label>
        Naam
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Bijv. Marijn van Dijk" />
      </label>
      <label>
        E-mailadres
        <input
          type="email"
          value={mail}
          onChange={(event) => setMail(event.target.value)}
          placeholder="naam@bedrijf.nl"
        />
      </label>

      {error && <p className="form-error">{error}</p>}
      {success && <p className="form-success">Opgeslagen.</p>}

      <div className="settings-card-actions">
        <button type="submit" className="primary-button" disabled={submitting}>
          {submitting ? 'Bezig...' : 'Profiel opslaan'}
        </button>
      </div>
    </form>
  );
}

function PasswordCard() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const canSubmit =
    currentPassword.length > 0 && newPassword.length >= 6 && newPassword === confirmPassword;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    setSuccess(false);
    try {
      await accountApi.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess(true);
      window.setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Wachtwoord wijzigen is niet gelukt.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="settings-card" onSubmit={handleSubmit}>
      <h2>
        <KeyRound size={16} style={{ verticalAlign: '-3px', marginRight: 8 }} />
        Wachtwoord
      </h2>
      <p className="settings-card-description">Wijzig je wachtwoord. Gebruik minimaal 6 tekens.</p>

      <label>
        Huidig wachtwoord
        <input
          type="password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          autoComplete="current-password"
        />
      </label>
      <label>
        Nieuw wachtwoord
        <input
          type="password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          autoComplete="new-password"
        />
      </label>
      <label>
        Bevestig nieuw wachtwoord
        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          autoComplete="new-password"
        />
      </label>
      {newPassword && confirmPassword && newPassword !== confirmPassword && (
        <p className="form-error">Wachtwoorden komen niet overeen.</p>
      )}

      {error && <p className="form-error">{error}</p>}
      {success && <p className="form-success">Wachtwoord bijgewerkt.</p>}

      <div className="settings-card-actions">
        <button type="submit" className="primary-button" disabled={!canSubmit || submitting}>
          {submitting ? 'Bezig...' : 'Wachtwoord wijzigen'}
        </button>
      </div>
    </form>
  );
}

interface TwoFactorCardProps {
  totpEnabled: boolean;
  onChanged: (user: AuthUser) => void;
}

function TwoFactorCard({ totpEnabled, onChanged }: TwoFactorCardProps) {
  const [setup, setSetup] = useState<accountApi.TotpSetupResponse | null>(null);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function startSetup() {
    setError('');
    setSubmitting(true);
    try {
      const response = await accountApi.setupTwoFactor();
      setSetup(response);
      setCode('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kon 2FA niet starten. Probeer het opnieuw.');
    } finally {
      setSubmitting(false);
    }
  }

  function cancelSetup() {
    setSetup(null);
    setCode('');
    setError('');
  }

  async function confirmSetup(event: FormEvent) {
    event.preventDefault();
    if (code.length !== 6) return;
    setSubmitting(true);
    setError('');
    try {
      const updated = await accountApi.enableTwoFactor(code);
      onChanged(updated);
      setSetup(null);
      setCode('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Ongeldige code. Probeer het opnieuw.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDisable(event: FormEvent) {
    event.preventDefault();
    if (code.length !== 6) return;
    setSubmitting(true);
    setError('');
    try {
      const updated = await accountApi.disableTwoFactor(code);
      onChanged(updated);
      setCode('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Ongeldige code. Probeer het opnieuw.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="settings-card settings-bar">
      <div className="settings-bar-row">
        <span className={`settings-bar-icon ${totpEnabled ? 'enabled' : ''}`}>
          <ShieldCheck size={20} />
        </span>
        <div className="settings-bar-copy">
          <div className="settings-bar-title">
            <h2>Tweestapsverificatie</h2>
            <StatusPill tone={totpEnabled ? 'green' : 'slate'}>{totpEnabled ? 'Ingeschakeld' : 'Uitgeschakeld'}</StatusPill>
          </div>
          <p className="settings-card-description">
            Beveilig je account met een extra verificatiecode uit een authenticator-app (bijv. Google Authenticator of
            Authy) bij het inloggen.
          </p>
        </div>

        {!totpEnabled && !setup && (
          <button type="button" className="primary-button settings-bar-action" onClick={startSetup} disabled={submitting}>
            <QrCode size={16} /> {submitting ? 'Bezig...' : 'Inschakelen'}
          </button>
        )}

        {totpEnabled && (
          <form className="settings-bar-inline-form" onSubmit={handleDisable}>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              placeholder="Huidige code"
              aria-label="Voer je huidige verificatiecode in om uit te schakelen"
            />
            <button type="submit" className="danger-button" disabled={code.length !== 6 || submitting}>
              <ShieldOff size={16} /> {submitting ? 'Bezig...' : 'Uitschakelen'}
            </button>
          </form>
        )}
      </div>

      {!setup && error && <p className="form-error">{error}</p>}

      {!totpEnabled && setup && (
        <form className="settings-bar-setup" onSubmit={confirmSetup}>
          <div className="settings-qr-box">
            <QRCodeSVG value={setup.otpAuthUri} size={168} />
          </div>
          <p className="settings-card-description">
            Scan deze QR-code met je authenticator-app, of voer de code hieronder handmatig in.
          </p>
          <p className="settings-secret">{setup.secret}</p>
          <label>
            Verificatiecode
            <input
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              placeholder="123456"
              autoFocus
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <div className="settings-card-actions">
            <button type="submit" className="primary-button" disabled={code.length !== 6 || submitting}>
              {submitting ? 'Bezig...' : 'Bevestigen en inschakelen'}
            </button>
            <button type="button" className="secondary-button" onClick={cancelSetup} disabled={submitting}>
              Annuleren
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
