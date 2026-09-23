import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import * as authApi from '../api/auth';
import type { AuthUser } from '../api/auth';
import { rememberAccount } from './rememberedAccounts';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string, totpCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.me()
      .then((loggedInUser) => {
        setUser(loggedInUser);
        if (loggedInUser) {
          rememberAccount({
            username: loggedInUser.username,
            displayName: loggedInUser.displayName,
            role: loggedInUser.role,
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(username: string, password: string, totpCode?: string) {
    const loggedInUser = await authApi.login(username, password, totpCode);
    setUser(loggedInUser);
    rememberAccount({
      username: loggedInUser.username,
      displayName: loggedInUser.displayName,
      role: loggedInUser.role,
    });
  }

  async function logout() {
    await authApi.logout();
    setUser(null);
  }

  function updateUser(updated: AuthUser) {
    setUser(updated);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
