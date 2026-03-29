import { create } from 'zustand';

interface TestModeStore {
  isTestMode: boolean;
  setTestMode: (enabled: boolean) => void;
}

/**
 * Test Mode Store
 * Manages whether the app is in test mode (using mock data) or production mode (using live API)
 */
export const useTestModeStore = create<TestModeStore>((set) => ({
  isTestMode: true, // Default to test mode
  setTestMode: (enabled: boolean) => {
    set({ isTestMode: enabled });
    // Optionally persist to localStorage
    localStorage.setItem('testMode', JSON.stringify(enabled));
  },
}));

/**
 * Initialize test mode from localStorage
 */
export function initTestMode() {
  const stored = localStorage.getItem('testMode');
  if (stored !== null) {
    useTestModeStore.setState({ isTestMode: JSON.parse(stored) });
  }
}
