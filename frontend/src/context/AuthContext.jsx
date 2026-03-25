import { createContext, useContext, useState, useCallback } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

const getStoredUser = () => {
  try {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) return JSON.parse(storedUser);
  } catch (_) {}
  return null;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await authService.login({ email, password });
      const { user: u, token } = res.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(u));
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data) => {
    setLoading(true);
    try {
      const res = await authService.register(data);
      const { user: u, token } = res.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(u));
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await authService.getProfile();
    const updated = res.data.data;
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAdmin: user?.role === 'ADMIN',
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
