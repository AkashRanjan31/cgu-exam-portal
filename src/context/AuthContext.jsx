import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, SESSION_TOKEN_KEY, SESSION_USER_KEY } from '../services/authService';
import { DEMO_CREDENTIALS } from '../utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Validate session on mount — in production this hits GET /auth/me
  useEffect(() => {
    const initAuth = async () => {
      try {
        const validatedUser = await authService.getProfile();
        setUser(validatedUser || null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  // Cross-tab coordination via localStorage events (sessionStorage does not
  // fire storage events across tabs, so we use a dedicated localStorage signal).
  useEffect(() => {
    const handleStorage = (e) => {
      // Another tab called logoutAll — clear this tab's session too
      if (e.key === 'cvrgu_logout_all' && e.newValue) {
        sessionStorage.removeItem(SESSION_TOKEN_KEY);
        setUser(null);
        setAuthError(null);
      }
      // Shared user profile was updated by another tab (e.g. admin edit)
      // Refresh in-memory user if this tab is still authenticated
      if (e.key === SESSION_USER_KEY && e.newValue) {
        const token = sessionStorage.getItem(SESSION_TOKEN_KEY);
        if (token) {
          try { setUser(JSON.parse(e.newValue)); } catch { /* ignore */ }
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      return response.user;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await authService.register(userData);
      setUser(response.user);
      return response.user;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setAuthError(null);
  }, []);

  // Invalidates all sessions on all tabs/devices for this account
  const logoutAll = useCallback(async () => {
    await authService.logoutAll();
    setUser(null);
    setAuthError(null);
  }, []);

  const quickDemoLogin = async (role = 'student') => {
    if (!DEMO_CREDENTIALS) return;
    const creds = DEMO_CREDENTIALS[role];
    if (creds) return await login(creds.email, creds.demoKey);
  };

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: !!user,
    loading,
    authError,
    setAuthError,
    login,
    register,
    logout,
    logoutAll,
    quickDemoLogin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
