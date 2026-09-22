import { useState, type FormEvent } from 'react';
import { LogIn } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';

export function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Inloggen is niet gelukt. Probeer het opnieuw.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <p className="eyebrow">EasyPilot</p>
        <h1>Inloggen</h1>
        <p className="modal-description">Log in om je documenttypes te beheren.</p>
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
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="primary-button" disabled={submitting || !username || !password}>
          <LogIn size={16} /> {submitting ? 'Bezig...' : 'Inloggen'}
        </button>
      </form>
    </div>
  );
}
