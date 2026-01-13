import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';

/**
 * API Key context value
 */
interface ApiKeyContextValue {
  apiKey: string | null;
  isLoading: boolean;
  hasApiKey: boolean;
  isEncryptionAvailable: boolean;
  saveApiKey: (key: string) => Promise<{ success: boolean; error?: string }>;
  deleteApiKey: () => Promise<{ success: boolean; error?: string }>;
  loadApiKey: () => Promise<void>;
}

const ApiKeyContext = createContext<ApiKeyContextValue | undefined>(undefined);

/**
 * Hook to access API key context
 */
export function useApiKey(): ApiKeyContextValue {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKey must be used within an ApiKeyProvider');
  }
  return context;
}

/**
 * API Key Provider component
 */
export function ApiKeyProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEncryptionAvailable, setIsEncryptionAvailable] = useState(true);

  /**
   * Load API key from persistent storage
   */
  const loadApiKey = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await window.api?.credentials.loadApiKey();
      if (result?.success) {
        setApiKey(result.apiKey);
        console.log('API key loaded:', result.apiKey ? 'present' : 'not found');
      } else {
        console.error('Failed to load API key:', result?.error);
      }
    } catch (error) {
      console.error('Error loading API key:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Save API key to persistent storage
   */
  const saveApiKey = useCallback(async (key: string) => {
    try {
      const result = await window.api?.credentials.saveApiKey(key);
      if (result?.success) {
        setApiKey(key);
        console.log('API key saved successfully');
      } else {
        console.error('Failed to save API key:', result?.error);
      }
      return result || { success: false, error: 'Unknown error' };
    } catch (error) {
      console.error('Error saving API key:', error);
      return { success: false, error: String(error) };
    }
  }, []);

  /**
   * Delete API key from persistent storage
   */
  const deleteApiKey = useCallback(async () => {
    try {
      const result = await window.api?.credentials.deleteApiKey();
      if (result?.success) {
        setApiKey(null);
        console.log('API key deleted successfully');
      } else {
        console.error('Failed to delete API key:', result?.error);
      }
      return result || { success: false, error: 'Unknown error' };
    } catch (error) {
      console.error('Error deleting API key:', error);
      return { success: false, error: String(error) };
    }
  }, []);

  /**
   * Check encryption availability and load API key on mount
   */
  useEffect(() => {
    const init = async () => {
      try {
        const encryptionResult =
          await window.api?.credentials.checkEncryptionAvailable();
        if (encryptionResult?.success) {
          setIsEncryptionAvailable(encryptionResult.available);
          console.log('Encryption available:', encryptionResult.available);
        }
      } catch (error) {
        console.error('Error checking encryption availability:', error);
      }

      await loadApiKey();
    };

    init();
  }, [loadApiKey]);

  const value: ApiKeyContextValue = {
    apiKey,
    isLoading,
    hasApiKey: !!apiKey,
    isEncryptionAvailable,
    saveApiKey,
    deleteApiKey,
    loadApiKey
  };

  return (
    <ApiKeyContext.Provider value={value}>{children}</ApiKeyContext.Provider>
  );
}
