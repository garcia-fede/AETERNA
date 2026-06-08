import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { queryClient } from '../main';
import type { LoginResponse, Rol } from '../types';

interface AuthUser {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: Rol;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  login: (response: LoginResponse) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      login: (response: LoginResponse) => {
        set({
          token: response.token,
          user: {
            id: response.userId,
            nombre: response.nombre,
            apellido: response.apellido,
            email: response.email,
            rol: response.rol,
          },
        });
      },

      logout: () => {
        set({ token: null, user: null });
        queryClient.clear();
      },

      isAuthenticated: () => {
        const state = get();
        return state.token !== null && state.user !== null;
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
