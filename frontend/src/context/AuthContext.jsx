import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | authenticated | unauthenticated

  const bootstrap = useCallback(async () => {
    const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
    if (!token) {
      setStatus('unauthenticated');
      return;
    }
    try {
      const { data } = await axiosClient.get('/auth/me');
      setUser(data.user);
      setStatus('authenticated');
    } catch {
      setStatus('unauthenticated');
    }
  }, []);

  useEffect(() => {
    bootstrap();
    const onLogout = () => logout();
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login({ email, password, rememberMe }) {
    const { data } = await axiosClient.post('/auth/login', { email, password });
    const store = rememberMe ? localStorage : sessionStorage;
    store.setItem('accessToken', data.accessToken);
    store.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
    setStatus('authenticated');
    return data.user;
  }

  function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    setUser(null);
    setStatus('unauthenticated');
  }

  const value = useMemo(() => ({ user, status, login, logout }), [user, status]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
