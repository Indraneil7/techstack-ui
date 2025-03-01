import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';

interface User {
  id: number;
  username: string;
  toolkitIds: number[];
  linkedIn?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAnonymous: boolean;
  token: string | null;
  
  // Actions
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, linkedIn?: string) => Promise<void>;
  continueAsGuest: () => void;
  logout: () => void;
  associateToolkit: (toolkitId: number) => void;
  clearGuestState: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isAnonymous: false,
      token: null,
      
      login: async (username, password) => {
        try {
          const data = await authService.login(username, password);
          
          set({ 
            user: {
              id: data.id,
              username: data.username,
              toolkitIds: data.toolkit_id || [],
              linkedIn: data.linkedIn
            }, 
            isAuthenticated: true,
            isAnonymous: false,
            token: data.token
          });
        } catch (error) {
          console.error('Login failed:', error);
          throw error;
        }
      },
      
      register: async (username, password, linkedIn) => {
        try {
          const data = await authService.register(username, password, linkedIn);
          
          set({ 
            user: {
              id: data.id,
              username: data.username,
              toolkitIds: [],
              linkedIn: data.linkedIn
            }, 
            isAuthenticated: true,
            isAnonymous: false,
            token: data.token
          });
        } catch (error) {
          console.error('Registration failed:', error);
          throw error;
        }
      },

      continueAsGuest: () => {
        // Clear any previous guest state
        localStorage.removeItem('auth-storage');
        set({ isAnonymous: true, isAuthenticated: false, user: null, token: null });
      },

      logout: () => {
        // Clear username cache on logout
        authService.clearUsernameCache();
        set({ isAuthenticated: false, user: null, isAnonymous: false, token: null });
      },

      clearGuestState: () => {
        if (localStorage.getItem('auth-storage')) {
          const authState = JSON.parse(localStorage.getItem('auth-storage') || '{}');
          if (authState.state?.isAnonymous) {
            localStorage.removeItem('auth-storage');
            set({ isAuthenticated: false, user: null, isAnonymous: false, token: null });
          }
        }
      },
      
      associateToolkit: (toolkitId) => {
        const { user, isAuthenticated } = get();
        if (!isAuthenticated || !user) return;
        
        // Update user in state
        const updatedToolkitIds = [...(user.toolkitIds || []), toolkitId];
        set({ user: { ...user, toolkitIds: updatedToolkitIds } });
        
        // Update user in database
        authService.associateToolkitWithUser(user.id, updatedToolkitIds)
          .catch(error => console.error('Failed to update user toolkit associations:', error));
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAnonymous: state.isAnonymous,
        token: state.token
      })
    }
  )
); 