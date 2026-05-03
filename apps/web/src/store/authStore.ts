import { create } from 'zustand';
import { setAccessToken } from '@/lib/api';
import type { UserPublic } from '@repo/types';

interface AuthState {
  user: UserPublic | null;
  accessToken: string | null;
  isLoading: boolean;
  setAuth: (user: UserPublic, token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  setAuth: (user, token) => {
    setAccessToken(token);
    set({ user, accessToken: token, isLoading: false });
  },
  clearAuth: () => {
    setAccessToken(null);
    set({ user: null, accessToken: null, isLoading: false });
  },
  setLoading: (isLoading) => set({ isLoading }),
}));
