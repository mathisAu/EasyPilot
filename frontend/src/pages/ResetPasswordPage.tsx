import { useState, type FormEvent } from 'react';
import { CheckCircle2, KeyRound } from 'lucide-react';
import { resetPassword } from '../api/auth';
import { ApiError } from '../api/client';

function readTokenFromUrl(): string {
  return new URLSearchParams(window.location.search).get('token') ?? '';
}

export function ResetPasswordPage() {
  const [token] = useState(readTokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const canSubmit = newPassword.length >= 6 && newPassword === confirmPassword;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      await resetPassword(token, newPassword);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Er ging iets mis. Probeer het opnieuw.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <span className="login-brand-mark">➤</span>
          <span>
            Easy<span>Pilot</span>
          </span>
        </div>

        {!token && (
          <div className="login-heading">
            <h1>Ongeldige link</h1>
            <p className="modal-description">
              Deze resetlink mist een token. Vraag een nieuwe link aan via de inlogpagina.
            </p>
          </div>
        )}

        {token && done && (
          <div className="login-heading">
            <h1>
              <CheckCircle2 size={20} style={{ verticalAlign: '-4px', marginRight: 8, color: '#29956b' }} />
              Wachtwoord ingesteld
            </h1>
            <p className="modal-description">Je kunt nu inloggen met je nieuwe wachtwoord.</p>
          </div>
        )}

        {token && !done && (
          <>
            <div className="login-heading">
              <h1>Nieuw wachtwoord</h1>
              <p className="modal-description">Kies een nieuw wachtwoord van minimaal 6 tekens.</p>
            </div>
            <form onSubmit={handleSubmit}>
              <label>
                Nieuw wachtwoord
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoFocus
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
              <button type="submit" className="primary-button" disabled={!canSubmit || submitting}>
                <KeyRound size={16} /> {submitting ? 'Bezig...' : 'Wachtwoord instellen'}
              </button>
            </form>
          </>
        )}

        <a className="text-button" href="/">
          Terug naar inloggen
        </a>
      </div>
    </div>
  );
}
