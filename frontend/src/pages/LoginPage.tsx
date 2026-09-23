import { useState, type FormEvent } from 'react';
import { LogIn, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { TotpRequiredError } from '../api/auth';

export function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [needsTotp, setNeedsTotp] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(username, password, needsTotp ? totpCode : undefined);
    } catch (err) {
      if (err instanceof TotpRequiredError) {
        setNeedsTotp(true);
        setTotpCode('');
      } else {
        setError(err instanceof ApiError ? err.message : 'Inloggen is niet gelukt. Probeer het opnieuw.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <span className="login-brand-mark">➤</span>
          <span>
            Easy<span>Pilot</span>
          </span>
        </div>
        <div className="login-heading">
          <h1>{needsTotp ? 'Verificatie' : 'Welkom terug'}</h1>
          <p className="modal-description">
            {needsTotp
              ? 'Voer de 6-cijferige code uit je authenticator-app in.'
              : 'Log in om je documenttypes te beheren.'}
          </p>
        </div>

        {!needsTotp && (
          <>
            <label>
              Gebruikersnaam
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoFocus
                autoComplete="username"
              />
            </label>
            <label>
              Wachtwoord
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </label>
          </>
        )}

        {needsTotp && (
          <label>
            Verificatiecode
            <input
              value={totpCode}
              onChange={(event) => setTotpCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              autoFocus
              autoComplete="one-time-code"
              inputMode="numeric"
              placeholder="123456"
            />
          </label>
        )}

        {error && <p className="form-error">{error}</p>}

        <button
          type="submit"
          className="primary-button"
          disabled={submitting || (needsTotp ? totpCode.length !== 6 : !username || !password)}
        >
          {needsTotp ? <ShieldCheck size={16} /> : <LogIn size={16} />}{' '}
          {submitting ? 'Bezig...' : needsTotp ? 'Verifiëren' : 'Inloggen'}
        </button>

        {needsTotp && (
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setNeedsTotp(false);
              setTotpCode('');
              setError('');
            }}
          >
            Terug
          </button>
        )}
      </form>
    </div>
  );
}
