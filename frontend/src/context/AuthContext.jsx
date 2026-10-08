import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService.js';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('acxiom_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('acxiom_token');
      const storedUser = localStorage.getItem('acxiom_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Refresh user profile from backend to ensure active status
          const profileRes = await authService.getMe();
          if (profileRes.data) {
            setUser(profileRes.data);
            localStorage.setItem('acxiom_user', JSON.stringify(profileRes.data));
          }
        } catch (error) {
          console.error('Failed to restore session:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.data) {
      const { user: userData, token: userToken } = res.data;
      setUser(userData);
      setToken(userToken);
      localStorage.setItem('acxiom_token', userToken);
      localStorage.setItem('acxiom_user', JSON.stringify(userData));
      return userData;
    }
  };

  const logout = useCallback(async () => {
    try {
      if (token) {
        await authService.logout();
      }
    } catch (err) {
      console.warn('Logout error', err);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('acxiom_token');
      localStorage.removeItem('acxiom_user');
      window.location.href = '/login';
    }
  }, [token]);

  const hasRole = useCallback((...allowedRoles) => {
    if (!user || !user.role) return false;
    const roleName = typeof user.role === 'object' ? user.role.name : user.role;
    return allowedRoles.includes(roleName);
  }, [user]);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    hasRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
