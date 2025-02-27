import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  // Simple flag for anonymous users
  isAnonymous: boolean;
  
  // Actions
  login: (username: string, password: string) => Promise<void>;
  continueAsGuest: () => void;
  logout: () => void;
  clearGuestState: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      username: null,
      isAnonymous: false,

      login: async (username, password) => {
        try {
          const response = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:JQwL4HAE/auth_tech/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          });
          
          if (!response.ok) throw new Error('Login failed');
          
          set({ isAuthenticated: true, username, isAnonymous: false });
        } catch (error) {
          console.error('Login error:', error);
          throw error;
        }
      },

      continueAsGuest: () => {
        // Clear any previous guest state
        localStorage.removeItem('auth-storage');
        set({ isAnonymous: true, isAuthenticated: false, username: null });
      },

      logout: () => {
        set({ isAuthenticated: false, username: null, isAnonymous: false });
      },

      clearGuestState: () => {
        if (localStorage.getItem('auth-storage')) {
          const authState = JSON.parse(localStorage.getItem('auth-storage') || '{}');
          if (authState.state?.isAnonymous) {
            localStorage.removeItem('auth-storage');
            set({ isAuthenticated: false, username: null, isAnonymous: false });
          }
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        ...state,
        // Don't persist guest state across page refreshes
        isAnonymous: false
      })
    }
  )
); 