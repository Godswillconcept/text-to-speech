import { useState, useCallback } from 'react';

/**
 * A generic custom hook for handling asynchronous API calls.
 */
export const useApi = (apiFunc) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const clearError = useCallback(() => setError(''), []);
  const clearData = useCallback(() => setData(null), []);

  const request = useCallback(async (...args) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await apiFunc(...args);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      console.error('API request failed:', errorMessage, err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [apiFunc]);

  return { data, isLoading, error, request, clearError, clearData };
};