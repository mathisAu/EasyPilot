import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Building2, ChevronDown, LogOut, Mail, Plus, Settings, ShieldCheck, UserPlus, UserRound } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { TotpRequiredError, registerAccount } from '../api/auth';
import { forgetAccount, getRememberedAccounts, type RememberedAccount } from '../auth/rememberedAccounts';

type MenuMode = 'menu' | 'switch' | 'add';

interface AccountSwitcherMenuProps {
  onOpenSettings: () => void;
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function AccountSwitcherMenu({ onOpenSettings }: AccountSwitcherMenuProps) {
  const { user, login, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<MenuMode>('menu');
  const [rememberedAccounts, setRememberedAccounts] = useState<RememberedAccount[]>(getRememberedAccounts);
  const [targetAccount, setTargetAccount] = useState<RememberedAccount | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [needsTotp, setNeedsTotp] = useState(false);
  const [registrationName, setRegistrationName] = useState('');
  const [registrationEmail, setRegistrationEmail] = useState('');
  const [registrationOrganization, setRegistrationOrganization] = useState('');
  const [registrationPasswordConfirmation, setRegistrationPasswordConfirmation] = useState('');
  const [registrationSent, setRegistrationSent] = useState('');
  const [registrationDestination, setRegistrationDestination] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayName = user?.displayName?.trim() || user?.username || 'Gebruiker';
  const roleLabel = user?.role === 'ADMIN' ? 'Beheerder' : 'Klant';
  const otherAccounts = rememberedAccounts.filter(
    (account) =>
      account.username.toLowerCase() !== user?.username.toLowerCase()
      && (user?.role === 'ADMIN' || account.role === 'CUSTOMER'),
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  function closeMenu() {
    setOpen(false);
    setMode('menu');
    setTargetAccount(null);
    setUsername('');
    setPassword('');
    setTotpCode('');
    setNeedsTotp(false);
    setRegistrationName('');
    setRegistrationEmail('');
    setRegistrationOrganization('');
    setRegistrationPasswordConfirmation('');
    setRegistrationSent('');
    setRegistrationDestination('');
    setError('');
  }

  function refreshRememberedAccounts() {
    setRememberedAccounts(getRememberedAccounts());
  }

  function startSwitch(account: RememberedAccount) {
    setTargetAccount(account);
    setUsername(account.username);
    setPassword('');
    setNeedsTotp(false);
    setRegistrationName('');
    setRegistrationEmail('');
    setRegistrationOrganization('');
    setRegistrationPasswordConfirmation('');
    setRegistrationSent('');
    setRegistrationDestination('');
    setError('');
    setMode('switch');
  }

  function startAdd() {
    window.location.assign('/register');
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'add') {
        if (password.length < 8) {
          setError('Je wachtwoord moet minimaal 8 tekens bevatten.');
          return;
        }
        if (password !== registrationPasswordConfirmation) {
          setError('De wachtwoorden komen niet overeen.');
          return;
        }
        const result = await registerAccount({
          displayName: registrationName.trim(),
          email: registrationEmail.trim(),
          username: username.trim(),
          password,
          organizationName: registrationOrganization.trim(),
        });
        setRegistrationSent(result.message);
        setRegistrationDestination(result.email);
        return;
      }
      await login(username, password, needsTotp ? totpCode : undefined);
      refreshRememberedAccounts();
      closeMenu();
    } catch (err) {
      if (err instanceof TotpRequiredError) {
        setNeedsTotp(true);
        setTotpCode('');
      } else {
        setError(err instanceof ApiError ? err.message : err instanceof TypeError ? 'De server is niet bereikbaar. Probeer het later opnieuw.' : 'Inloggen is niet gelukt.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleForget(account: RememberedAccount) {
    forgetAccount(account.username);
    refreshRememberedAccounts();
    closeMenu();
  }

  return (
    <div className="account-switcher" ref={containerRef}>
      <button className="sidebar-footer" type="button" onClick={() => setOpen((o) => !o)}>
        <div className="avatar">{initials(displayName)}</div>
        <div>
          <strong>{displayName}</strong>
          <small>{roleLabel}</small>
        </div>
        <ChevronDown size={15} />
      </button>

      {open && (
        <div className="account-switcher-panel">
          {mode === 'menu' && (
            <>
              <div className="account-switcher-current">
                <div className="avatar">{initials(displayName)}</div>
                <div>
                  <strong>{displayName}</strong>
                  <small>{roleLabel}</small>
                </div>
              </div>

              <button type="button" className="account-switcher-item" onClick={onOpenSettings}>
                <Settings size={15} /> Instellingen
              </button>

              {otherAccounts.length > 0 && (
                <>
                  <div className="account-switcher-label">Andere accounts</div>
                  {otherAccounts.map((account) => (
                    <button
                      key={account.username}
                      type="button"
                      className="account-switcher-item"
                      onClick={() => startSwitch(account)}
                    >
                      <span className="avatar avatar-sm">{initials(account.displayName || account.username)}</span>
                      <span className="account-switcher-item-copy">
                        <strong>{account.displayName || account.username}</strong>
                        <small>{account.role === 'ADMIN' ? 'Beheerder' : 'Klant'}</small>
                      </span>
                    </button>
                  ))}
                </>
              )}

              <button type="button" className="account-switcher-item" onClick={startAdd}>
                <Plus size={15} /> Account toevoegen
              </button>

              <div className="account-switcher-divider" />
              <button type="button" className="account-switcher-item danger" onClick={() => logout()}>
                <LogOut size={15} /> Uitloggen
              </button>
            </>
          )}

          {(mode === 'switch' || mode === 'add') && (
            <form className="account-switcher-form" onSubmit={handleSubmit}>
              <p className="account-switcher-label">{mode === 'switch' ? `Inloggen als ${targetAccount?.displayName || username}` : 'Account toevoegen'}</p>

              {mode === 'add' && registrationSent && (
                <>
                  <p className="account-switcher-success">{registrationSent} <strong className="registration-email">{registrationDestination}</strong></p>
                  <button type="button" className="text-button" onClick={() => setMode('menu')}>Terug naar accounts</button>
                </>
              )}

              {!needsTotp && !registrationSent && (
                <>
                  {mode === 'add' && (
                    <>
                      <label>
                        Naam
                        <input value={registrationName} onChange={(event) => setRegistrationName(event.target.value)} autoFocus autoComplete="name" />
                      </label>
                      <label>
                        <span><Mail size={13} /> E-mailadres</span>
                        <input type="email" value={registrationEmail} onChange={(event) => setRegistrationEmail(event.target.value)} autoComplete="email" />
                      </label>
                      <label>
                        <span><Building2 size={13} /> Organisatie</span>
                        <input value={registrationOrganization} onChange={(event) => setRegistrationOrganization(event.target.value)} autoComplete="organization" />
                      </label>
                      <label>
                        Gebruikersnaam
                        <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" />
                      </label>
                    </>
                  )}
                  <label>
                    Wachtwoord
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoFocus={mode === 'switch'}
                      autoComplete="current-password"
                    />
                  </label>
                  {mode === 'add' && (
                    <label>
                      Bevestig wachtwoord
                      <input type="password" value={registrationPasswordConfirmation} onChange={(event) => setRegistrationPasswordConfirmation(event.target.value)} autoComplete="new-password" />
                    </label>
                  )}
                  {mode === 'add' && registrationPasswordConfirmation && password !== registrationPasswordConfirmation && (
                    <p className="form-error">De wachtwoorden komen niet overeen.</p>
                  )}
                </>
              )}

              {needsTotp && (
                <label>
                  <ShieldCheck size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />
                  Verificatiecode
                  <input
                    value={totpCode}
                    onChange={(event) => setTotpCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    autoFocus
                    inputMode="numeric"
                    placeholder="123456"
                  />
                </label>
              )}

              {error && <p className="form-error">{error}</p>}

              {!registrationSent && <div className="account-switcher-form-actions">
                {mode === 'switch' && !needsTotp && (
                  <button type="button" className="text-button" onClick={() => targetAccount && handleForget(targetAccount)}>
                    Vergeten
                  </button>
                )}
                <button type="button" className="text-button" onClick={() => setMode('menu')}>
                  Terug
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={submitting || !username || (mode === 'add' && (!registrationName || !registrationEmail || !registrationOrganization || password.length < 8 || !registrationPasswordConfirmation || password !== registrationPasswordConfirmation)) || (needsTotp ? totpCode.length !== 6 : password.length < (mode === 'add' ? 8 : 1))}
                >
                  {mode === 'add' ? <UserPlus size={14} /> : <UserRound size={14} />} {submitting ? 'Bezig...' : mode === 'add' ? 'Account aanmaken' : 'Inloggen'}
                </button>
              </div>}
            </form>
          )}
        </div>
      )}
    </div>
  );
}
