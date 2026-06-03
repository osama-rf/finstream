'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode, useRef } from 'react';
import type { User } from '@/lib/types/database';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  refetchUser: () => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const CACHE_DURATION = 10 * 60 * 1000;

let cachedUser: User | null = null;
let cacheTime = 0;
let inflightFetch: Promise<void> | null = null;

const USER_CACHE_KEY = 'finstream-user-cache-v1';

function readBrowserCache() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(USER_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { user: User | null; cacheTime: number };
    if (!parsed?.cacheTime) return null;
    if (Date.now() - parsed.cacheTime > CACHE_DURATION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeBrowserCache(user: User | null, time: number) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify({ user, cacheTime: time }));
  } catch {}
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(cachedUser);
  const [isLoading, setIsLoading] = useState(cachedUser === null);
  const [error, setError] = useState<string | null>(null);
  const fetchInProgress = useRef(false);

  const fetchUser = useCallback(async (force = false) => {
    if (fetchInProgress.current && !force && inflightFetch) return inflightFetch;
    const now = Date.now();
    if (!force && cachedUser && now - cacheTime < CACHE_DURATION) {
      setUser(cachedUser);
      setIsLoading(false);
      return;
    }

    if (!force) {
      const browserCache = readBrowserCache();
      if (browserCache?.user) {
        cachedUser = browserCache.user;
        cacheTime = browserCache.cacheTime;
        setUser(browserCache.user);
        setIsLoading(false);
        return;
      }
    }

    fetchInProgress.current = true;
    if (!cachedUser) setIsLoading(true);

    inflightFetch = (async () => {
      try {
        const res = await fetch('/api/auth/profile');
        const json = await res.json();
        if (json.success && json.data) {
          cachedUser = json.data;
          cacheTime = Date.now();
          writeBrowserCache(json.data, cacheTime);
          setUser(json.data);
        } else {
          cachedUser = null;
          cacheTime = 0;
          writeBrowserCache(null, 0);
          setUser(null);
        }
      } catch {
        setError('حدث خطأ');
      } finally {
        setIsLoading(false);
        fetchInProgress.current = false;
        inflightFetch = null;
      }
    })();

    return inflightFetch;
  }, []);

  const logout = useCallback(() => {
    cachedUser = null;
    cacheTime = 0;
    writeBrowserCache(null, 0);
    setUser(null);
  }, []);

  const refetchUser = useCallback(() => fetchUser(true), [fetchUser]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    refetchUser,
    logout,
  }), [user, isLoading, error, refetchUser, logout]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}

export function useCurrentUser() { return useUser().user; }
export function useIsAuthenticated() { return useUser().isAuthenticated; }
