import { useEffect } from 'react';
import { useTestModeStore } from '@/store/testModeStore';

/**
 * Hook to send test mode state to the API via headers
 * This allows the API to know whether to use mock data or live API
 */
export function useTestModeSync() {
  const { isTestMode } = useTestModeStore();

  useEffect(() => {
    // Store in sessionStorage so it can be accessed during API calls
    sessionStorage.setItem('testMode', JSON.stringify(isTestMode));
  }, [isTestMode]);

  return isTestMode;
}
