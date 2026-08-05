import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserPreferences {
  theme: 'light' | 'dark';
  currency: string;
  favoriteDestinations: string[];
  dietaryRestrictions: string[];
}

interface AppState {
  preferences: UserPreferences;
  setTheme: (theme: 'light' | 'dark') => void;
  setCurrency: (currency: string) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      preferences: {
        theme: 'dark',
        currency: 'USD',
        favoriteDestinations: [],
        dietaryRestrictions: [],
      },
      setTheme: (theme) => set((state) => ({ preferences: { ...state.preferences, theme } })),
      setCurrency: (currency) => set((state) => ({ preferences: { ...state.preferences, currency } })),
      updatePreferences: (prefs) => set((state) => ({ preferences: { ...state.preferences, ...prefs } })),
    }),
    {
      name: 'travel-planner-storage',
    }
  )
);
