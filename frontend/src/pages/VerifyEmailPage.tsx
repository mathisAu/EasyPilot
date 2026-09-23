import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { verifyEmail } from '../api/auth';
import { ApiError } from '../api/client';

export function VerifyEmailPage() {
  const [message, setMessage] = useState('E-mailadres controleren...');
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token') ?? '';
    if (!token) {
      setError('Deze bevestigingslink mist een token.');
      return;
    }
    verifyEmail(token)
      .then((result) => {
        setMessage(result);
        setVerified(true);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Bevestigen is niet gelukt.'));
  }, []);

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <span className="login-brand-mark">➤</span>
          <span>Easy<span>Pilot</span></span>
        </div>
        <div className="login-heading">
          {error ? (
            <h1><XCircle size={20} style={{ verticalAlign: '-4px', marginRight: 8, color: '#d5573b' }} />Link ongeldig</h1>
          ) : verified ? (
            <h1><CheckCircle2 size={20} style={{ verticalAlign: '-4px', marginRight: 8, color: '#29956b' }} />Account bevestigd</h1>
          ) : (
            <h1>Account controleren</h1>
          )}
          <p className="modal-description">{error || message}</p>
        </div>
        <a className="text-button" href="/">Naar inloggen</a>
      </div>
    </div>
  );
}
