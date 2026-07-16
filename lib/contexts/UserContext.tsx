'use client';

import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import type { User } from '@/lib/types/database';

// ── Mock user — no auth, full prototype mode ──────────────────────────────────
const MOCK_USER: User = {
  id: 'mock-001',
  email: 'admin@rakaez.sa',
  first_name: 'أسامة',
  last_name: 'الرفاعي',
  role: 'company_admin',
  status: 'active',
  avatar_url: null,
  avatar_emoji: null,
  company_id: 'company-001',
  companies: {
    id: 'company-001',
    name: 'Horizon Technology & Consulting Co.',
    name_ar: 'شركة الأفق للتقنية والاستشارات',
    commercial_registration: '1010123456',
    tax_number: '300012345600003',
    bank_account_iban: 'SA44 2000 0001 2345 6789 1234',
    logo_url: null,
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
  },
  created_at: '2025-01-01T00:00:00Z',
};

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  refetchUser: () => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(MOCK_USER);
  useEffect(() => {
    const avatar = window.localStorage.getItem('rakaez-profile-avatar');
    if (avatar) setUser(current => ({ ...current, avatar_url: avatar }));
  }, []);
  const value = useMemo<UserContextType>(() => ({
    user,
    isLoading: false,
    isAuthenticated: true,
    error: null,
    refetchUser: async () => {},
    logout: () => {},
    updateUser: (updates) => setUser(current => ({ ...current, ...updates })),
  }), [user]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}

export function useCurrentUser() { return useUser().user; }
export function useIsAuthenticated() { return useUser().isAuthenticated; }
