'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      role: null,
      isAuthenticated: false,
      
      login: (userData) => set({ 
        user: userData, 
        role: userData.role,
        isAuthenticated: true 
      }),
      
      logout: () => set({ 
        user: null, 
        role: null,
        isAuthenticated: false 
      }),
      
      setRole: (newRole) => set((state) => ({ 
        role: newRole,
        user: state.user ? { ...state.user, role: newRole } : null
      })),
      
      updateUser: (userData) => set((state) => ({
        user: { ...state.user, ...userData }
      }))
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
