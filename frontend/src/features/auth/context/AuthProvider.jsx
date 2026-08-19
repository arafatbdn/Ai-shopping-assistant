import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../../../shared/api/client.js';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    return JSON.parse(window.localStorage.getItem('nova_user') || 'null');
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [checking, setChecking] = useState(Boolean(window.localStorage.getItem('nova_access_token')));

  useEffect(() => {
    const token = window.localStorage.getItem('nova_access_token');
    if (!token) {
      setChecking(false);
      return undefined;
    }

    let active = true;
    api.get('/auth/me')
      .then(({ data }) => {
        if (!active) return;
        setUser(data.user);
        window.localStorage.setItem('nova_user', JSON.stringify(data.user));
      })
      .catch(() => {
        if (!active) return;
        window.localStorage.removeItem('nova_access_token');
        window.localStorage.removeItem('nova_user');
        setUser(null);
      })
      .finally(() => active && setChecking(false));

    return () => { active = false; };
  }, []);

  const value = useMemo(() => ({
    user,
    checking,
    isAuthenticated: Boolean(user),
    setSession: (session) => {
      window.localStorage.setItem('nova_access_token', session.token);
      window.localStorage.setItem('nova_user', JSON.stringify(session.user));
      setUser(session.user);
    },
    signOut: () => {
      window.localStorage.removeItem('nova_access_token');
      window.localStorage.removeItem('nova_user');
      setUser(null);
    },
  }), [user, checking]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
