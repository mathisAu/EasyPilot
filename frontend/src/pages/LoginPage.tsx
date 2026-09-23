import { useRef, useState, type FormEvent } from 'react';
import { LogIn, Mail, ShieldCheck, UserPlus } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { TotpRequiredError, forgotPassword, registerAccount } from '../api/auth';

type Mode = 'login' | 'register' | 'totp' | 'forgot' | 'forgot-sent';

interface LoginPageProps {
  initialMode?: Mode;
}

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

export function LoginPage({ initialMode = 'login' }: LoginPageProps) {
  const { login } = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPasswordConfirmation, setRegisterPasswordConfirmation] = useState('');
  const [registerOrganization, setRegisterOrganization] = useState('');
  const [registerMessage, setRegisterMessage] = useState('');
  const [registerDestination, setRegisterDestination] = useState('');

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

  async function handleRegisterSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (registerPassword.length < 8) {
      setError('Je wachtwoord moet minimaal 8 tekens bevatten.');
      return;
    }
    if (registerPassword !== registerPasswordConfirmation) {
      setError('De wachtwoorden komen niet overeen.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await registerAccount({
        displayName: registerName.trim(),
        email: registerEmail.trim(),
        username: registerUsername.trim(),
        password: registerPassword,
        organizationName: registerOrganization.trim(),
      });
      setRegisterMessage(result.message);
      setRegisterDestination(result.email);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err instanceof TypeError ? 'De server is niet bereikbaar. Probeer het later opnieuw.' : 'Account aanmaken is niet gelukt.');
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
      <form className="login-card" onSubmit={mode === 'register' ? handleRegisterSubmit : handleSubmit}>
        <Brand />
        <div className="login-heading">
          <h1>{mode === 'totp' ? 'Verificatie' : mode === 'register' ? 'Account aanmaken' : 'Welkom terug'}</h1>
          <p className="modal-description">
            {mode === 'totp'
              ? 'Voer de 6-cijferige code uit je authenticator-app in.'
              : mode === 'register'
                ? registerMessage ? <>{registerMessage} <strong className="registration-email">{registerDestination}</strong></> : 'Maak een account aan. We sturen een bevestigingslink naar je e-mailadres.'
              : 'Log in om je documenttypes te beheren.'}
          </p>
        </div>

        {mode === 'register' && !registerMessage && (
          <>
            <label>
              Volledige naam
              <input value={registerName} onChange={(event) => setRegisterName(event.target.value)} autoFocus autoComplete="name" />
            </label>
            <label>
              E-mailadres
              <input type="email" value={registerEmail} onChange={(event) => setRegisterEmail(event.target.value)} autoComplete="email" />
            </label>
            <label>
              Gebruikersnaam
              <input value={registerUsername} onChange={(event) => setRegisterUsername(event.target.value)} autoComplete="username" />
            </label>
            <label>
              Organisatienaam
              <input value={registerOrganization} onChange={(event) => setRegisterOrganization(event.target.value)} autoComplete="organization" />
            </label>
            <label>
              Wachtwoord
              <input type="password" value={registerPassword} onChange={(event) => setRegisterPassword(event.target.value)} autoComplete="new-password" />
            </label>
            <label>
              Bevestig wachtwoord
              <input type="password" value={registerPasswordConfirmation} onChange={(event) => setRegisterPasswordConfirmation(event.target.value)} autoComplete="new-password" />
            </label>
            {registerPasswordConfirmation && registerPassword !== registerPasswordConfirmation && (
              <p className="form-error">De wachtwoorden komen niet overeen.</p>
            )}
          </>
        )}

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

        {!registerMessage && (
          <button
            type="submit"
            className="primary-button"
            disabled={submitting || (mode === 'totp' ? totpCode.length !== 6 : mode === 'register' ? !registerName || !registerEmail || !registerUsername || !registerOrganization || registerPassword.length < 8 || !registerPasswordConfirmation || registerPassword !== registerPasswordConfirmation : !username || !password)}
          >
            {mode === 'totp' ? <ShieldCheck size={16} /> : mode === 'register' ? <UserPlus size={16} /> : <LogIn size={16} />}{' '}
            {submitting ? 'Bezig...' : mode === 'totp' ? 'Verifiëren' : mode === 'register' ? 'Account aanmaken' : 'Inloggen'}
          </button>
        )}

        {mode === 'login' && (
          <>
            <button type="button" className="text-button" onClick={() => setMode('forgot')}>
              Wachtwoord vergeten?
            </button>
            <button type="button" className="text-button" onClick={() => { setMode('register'); setError(''); }}>
              <UserPlus size={14} /> Account aanmaken
            </button>
          </>
        )}

        {mode === 'register' && (
          <button type="button" className="text-button" onClick={() => { setMode('login'); setRegisterMessage(''); setRegisterDestination(''); setError(''); }}>
            Terug naar inloggen
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
