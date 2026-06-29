import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { fetchCurrentUser, loginAccount, registerAccount } from '@/auth/api';
import type { AuthUser } from '@/auth/types';

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  status: 'signed-out' | 'loading' | 'signed-in';
  error: string | null;
  register: (payload: { name: string; email: string; password: string }) => Promise<void>;
  login: (payload: { email: string; password: string }) => Promise<void>;
  restore: () => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      status: 'signed-out',
      error: null,
      register: async (payload) => {
        set({ status: 'loading', error: null });
        try {
          const result = await registerAccount(payload);
          set({ user: result.user, token: result.token, status: 'signed-in' });
        } catch (error) {
          set({ status: 'signed-out', error: error instanceof Error ? error.message : 'Registration failed.' });
          throw error;
        }
      },
      login: async (payload) => {
        set({ status: 'loading', error: null });
        try {
          const result = await loginAccount(payload);
          set({ user: result.user, token: result.token, status: 'signed-in' });
        } catch (error) {
          set({ status: 'signed-out', error: error instanceof Error ? error.message : 'Login failed.' });
          throw error;
        }
      },
      restore: async () => {
        const token = get().token;
        if (!token) {
          return;
        }

        set({ status: 'loading', error: null });
        try {
          const result = await fetchCurrentUser(token);
          set({ user: result.user, status: 'signed-in' });
        } catch {
          set({ user: null, token: null, status: 'signed-out', error: null });
        }
      },
      logout: () => {
        set({ user: null, token: null, status: 'signed-out', error: null });
      },
    }),
    {
      name: 'karras-auth-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    },
  ),
);
