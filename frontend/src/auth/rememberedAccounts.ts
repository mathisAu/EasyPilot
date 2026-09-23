const STORAGE_KEY = 'easypilot_remembered_accounts';
const MAX_ACCOUNTS = 6;

export interface RememberedAccount {
  username: string;
  displayName: string | null;
  role: 'ADMIN' | 'CUSTOMER';
}

export function getRememberedAccounts(): RememberedAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RememberedAccount[]) : [];
  } catch {
    return [];
  }
}

export function rememberAccount(account: RememberedAccount): void {
  try {
    const current = getRememberedAccounts().filter((a) => a.username.toLowerCase() !== account.username.toLowerCase());
    const next = [account, ...current].slice(0, MAX_ACCOUNTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage unavailable (private browsing, etc.) — non-fatal, just skip remembering
  }
}

export function forgetAccount(username: string): void {
  try {
    const next = getRememberedAccounts().filter((a) => a.username.toLowerCase() !== username.toLowerCase());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}
