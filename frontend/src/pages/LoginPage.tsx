import { useRef, useState, type FormEvent } from 'react';
import { LogIn, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { TotpRequiredError, forgotPassword } from '../api/auth';

type Mode = 'login' | 'totp' | 'forgot' | 'forgot-sent';

function Brand() {
  return (
    <div className="login-brand">
      <span className="login-brand-mark">➤</span>
      <span>
        Easy<span>Pilot</span>
      </span>
    </div>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const [mode, setMode] = useState<Mode>('login');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const totpRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    // Read the live DOM value as a fallback: browser autofill doesn't always fire
    // React's onChange before the first Enter-triggered submit, which left the
    // controlled state empty/stale and made the very first login attempt fail.
    const effectiveUsername = usernameRef.current?.value || username;
    const effectivePassword = passwordRef.current?.value || password;
    const effectiveTotp = totpRef.current?.value || totpCode;
    try {
      await login(effectiveUsername, effectivePassword, mode === 'totp' ? effectiveTotp : undefined);
    } catch (err) {
      if (err instanceof TotpRequiredError) {
        setMode('totp');
        setTotpCode('');
      } else {
        setError(err instanceof ApiError ? err.message : 'Inloggen is niet gelukt. Probeer het opnieuw.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgotSubmit(event: FormEvent) {
    event.preventDefault();
    if (!forgotEmail.trim()) return;
    setError('');
    setSubmitting(true);
    try {
      const message = await forgotPassword(forgotEmail.trim());
      setForgotMessage(message);
      setMode('forgot-sent');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Er ging iets mis. Probeer het opnieuw.');
    } finally {
      setSubmitting(false);
    }
  }

  if (mode === 'forgot' || mode === 'forgot-sent') {
    return (
      <div className="login-page">
        <div className="login-card">
          <Brand />
          <div className="login-heading">
            <h1>Wachtwoord vergeten</h1>
            <p className="modal-description">
              {mode === 'forgot-sent'
                ? forgotMessage
                : 'Vul je e-mailadres in, dan sturen we een link om je wachtwoord opnieuw in te stellen.'}
            </p>
          </div>

          {mode === 'forgot' && (
            <form onSubmit={handleForgotSubmit}>
              <label>
                E-mailadres
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(event) => setForgotEmail(event.target.value)}
                  autoFocus
                  autoComplete="email"
                  placeholder="naam@bedrijf.nl"
                />
              </label>
              {error && <p className="form-error">{error}</p>}
              <button type="submit" className="primary-button" disabled={submitting || !forgotEmail.trim()}>
                <Mail size={16} /> {submitting ? 'Bezig...' : 'Resetlink versturen'}
              </button>
            </form>
          )}

          <button
            type="button"
            className="text-button"
            onClick={() => {
              setMode('login');
              setError('');
              setForgotEmail('');
            }}
          >
            Terug naar inloggen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <Brand />
        <div className="login-heading">
          <h1>{mode === 'totp' ? 'Verificatie' : 'Welkom terug'}</h1>
          <p className="modal-description">
            {mode === 'totp'
              ? 'Voer de 6-cijferige code uit je authenticator-app in.'
              : 'Log in om je documenttypes te beheren.'}
          </p>
        </div>

        {mode === 'login' && (
          <>
            <label>
              Gebruikersnaam
              <input
                ref={usernameRef}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoFocus
                autoComplete="username"
              />
            </label>
            <label>
              Wachtwoord
              <input
                ref={passwordRef}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </label>
          </>
        )}

        {mode === 'totp' && (
          <label>
            Verificatiecode
            <input
              ref={totpRef}
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
          disabled={submitting || (mode === 'totp' ? totpCode.length !== 6 : !username || !password)}
        >
          {mode === 'totp' ? <ShieldCheck size={16} /> : <LogIn size={16} />}{' '}
          {submitting ? 'Bezig...' : mode === 'totp' ? 'Verifiëren' : 'Inloggen'}
        </button>

        {mode === 'login' && (
          <button type="button" className="text-button" onClick={() => setMode('forgot')}>
            Wachtwoord vergeten?
          </button>
        )}

        {mode === 'totp' && (
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setMode('login');
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
