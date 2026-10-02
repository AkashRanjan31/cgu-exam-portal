import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
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

  // Cross-tab logout: if another tab clears the token, log out this tab too
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'cvrgu_auth_token' && !e.newValue) {
        setUser(null);
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

  // Quick demo login — only available in development builds
  const quickDemoLogin = import.meta.env.DEV
    ? async (role = 'student') => {
        if (!DEMO_CREDENTIALS) return;
        const creds = DEMO_CREDENTIALS[role];
        if (creds) return await login(creds.email, creds.demoKey);
      }
    : undefined;

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
    ...(quickDemoLogin ? { quickDemoLogin } : {})
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
