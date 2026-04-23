'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api';
import type { AuthUser } from './types';

const AUTH_TOKEN_KEY = 'aria_auth_token';

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  register: (payload: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
  }) => Promise<void>;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = window.localStorage.getItem(AUTH_TOKEN_KEY);
    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    setToken(savedToken);
    api.me(savedToken)
      .then(setUser)
      .catch(() => {
        window.localStorage.removeItem(AUTH_TOKEN_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function login(identifier: string, password: string) {
    const response = await api.login(identifier, password);
    window.localStorage.setItem(AUTH_TOKEN_KEY, response.token);
    setToken(response.token);
    setUser(response.user);
  }

  async function register(payload: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
  }) {
    const response = await api.register(payload);
    window.localStorage.setItem(AUTH_TOKEN_KEY, response.token);
    setToken(response.token);
    setUser(response.user);
  }

  function logout() {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  async function refreshUser() {
    if (!token) {
      setUser(null);
      return;
    }
    const me = await api.me(token);
    setUser(me);
  }

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    isLoading,
    register,
    login,
    logout,
    refreshUser,
  }), [user, token, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
