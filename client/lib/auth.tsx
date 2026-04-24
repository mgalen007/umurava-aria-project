'use client';

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api } from './api';
import type { AuthUser } from './types';

const AUTH_TOKEN_KEY = 'aria_auth_token';
let bootstrappedToken: string | null = null;
let bootstrappedUserPromise: Promise<AuthUser> | null = null;

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
  const requestVersionRef = useRef(0);

  function nextRequestVersion() {
    requestVersionRef.current += 1;
    return requestVersionRef.current;
  }

  function isCurrentRequest(version: number) {
    return requestVersionRef.current === version;
  }

  function persistAuth(nextToken: string, nextUser: AuthUser) {
    bootstrappedToken = nextToken;
    bootstrappedUserPromise = Promise.resolve(nextUser);
    window.localStorage.setItem(AUTH_TOKEN_KEY, nextToken);
    setToken(nextToken);
    setUser(nextUser);
  }

  function clearAuth() {
    bootstrappedToken = null;
    bootstrappedUserPromise = null;
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  function getBootstrappedUser(tokenToLoad: string) {
    if (bootstrappedToken !== tokenToLoad || !bootstrappedUserPromise) {
      bootstrappedToken = tokenToLoad;
      bootstrappedUserPromise = api.me(tokenToLoad);
    }

    return bootstrappedUserPromise;
  }

  useEffect(() => {
    const savedToken = window.localStorage.getItem(AUTH_TOKEN_KEY);
    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    const requestVersion = nextRequestVersion();
    setToken(savedToken);
    getBootstrappedUser(savedToken)
      .then((nextUser) => {
        if (!isCurrentRequest(requestVersion)) return;
        setUser(nextUser);
      })
      .catch(() => {
        if (!isCurrentRequest(requestVersion)) return;
        clearAuth();
      })
      .finally(() => {
        if (isCurrentRequest(requestVersion)) {
          setIsLoading(false);
        }
      });
  }, []);

  async function login(identifier: string, password: string) {
    const requestVersion = nextRequestVersion();
    const response = await api.login(identifier, password);
    if (!isCurrentRequest(requestVersion)) return;
    persistAuth(response.token, response.user);
  }

  async function register(payload: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
  }) {
    const requestVersion = nextRequestVersion();
    const response = await api.register(payload);
    if (!isCurrentRequest(requestVersion)) return;
    persistAuth(response.token, response.user);
  }

  function logout() {
    nextRequestVersion();
    clearAuth();
  }

  async function refreshUser() {
    if (!token) {
      setUser(null);
      return;
    }
    const requestVersion = nextRequestVersion();
    const me = await api.me(token);
    if (!isCurrentRequest(requestVersion)) return;
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
