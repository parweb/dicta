import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'

import type { BedrockContextValue, BedrockCredentials } from '../lib/bedrock/types'

export type { BedrockCredentials } from '../lib/bedrock/types'

const BedrockContext = createContext<BedrockContextValue | undefined>(undefined)

/**
 * Hook to access Bedrock context
 */
export function useBedrock(): BedrockContextValue {
  const context = useContext(BedrockContext)
  if (context === undefined) {
    throw new Error('useBedrock must be used within a BedrockProvider')
  }
  return context
}

/**
 * Bedrock Provider component
 */
export function BedrockProvider({ children }: { children: React.ReactNode }) {
  const [credentials, setCredentials] = useState<BedrockCredentials | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEncryptionAvailable, setIsEncryptionAvailable] = useState(true)

  /**
   * Load Bedrock credentials from persistent storage
   */
  const loadCredentials = useCallback(async () => {
    setIsLoading(true)
    try {
      console.log('[BEDROCK-CONTEXT] Loading credentials...')
      const result = await window.api?.credentials.loadBedrock()
      console.log('[BEDROCK-CONTEXT] Load result:', result)
      if (result?.success) {
        setCredentials(result.credentials)
        console.log(
          '[BEDROCK-CONTEXT] Credentials loaded:',
          result.credentials ? 'present' : 'not found'
        )
      } else {
        console.error('[BEDROCK-CONTEXT] Failed to load credentials:', result?.error)
      }
    } catch (error) {
      console.error('[BEDROCK-CONTEXT] Error loading credentials:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Save Bedrock credentials to persistent storage
   */
  const saveCredentials = useCallback(async (newCredentials: BedrockCredentials) => {
    try {
      const result = await window.api?.credentials.saveBedrock(newCredentials)
      if (result?.success) {
        setCredentials(newCredentials)
        console.log('[BEDROCK-CONTEXT] Credentials saved successfully')
      } else {
        console.error('[BEDROCK-CONTEXT] Failed to save credentials:', result?.error)
        throw new Error(result?.error || 'Failed to save credentials')
      }
    } catch (error) {
      console.error('[BEDROCK-CONTEXT] Error saving credentials:', error)
      throw error
    }
  }, [])

  /**
   * Delete Bedrock credentials from persistent storage
   */
  const deleteCredentials = useCallback(async () => {
    try {
      const result = await window.api?.credentials.deleteBedrock()
      if (result?.success) {
        setCredentials(null)
        console.log('[BEDROCK-CONTEXT] Credentials deleted successfully')
      } else {
        console.error('[BEDROCK-CONTEXT] Failed to delete credentials:', result?.error)
        throw new Error(result?.error || 'Failed to delete credentials')
      }
    } catch (error) {
      console.error('[BEDROCK-CONTEXT] Error deleting credentials:', error)
      throw error
    }
  }, [])

  /**
   * Check encryption availability and load credentials on mount
   */
  useEffect(() => {
    const init = async () => {
      try {
        const encryptionResult = await window.api?.credentials.checkEncryptionAvailable()
        if (encryptionResult?.success) {
          setIsEncryptionAvailable(encryptionResult.available)
          console.log('[BEDROCK-CONTEXT] Encryption available:', encryptionResult.available)
        }
      } catch (error) {
        console.error('[BEDROCK-CONTEXT] Error checking encryption availability:', error)
      }

      await loadCredentials()
    }

    init()
  }, [loadCredentials])

  const value: BedrockContextValue = {
    credentials,
    hasCredentials: !!credentials?.bearerToken,
    isLoading,
    isEncryptionAvailable,
    saveCredentials,
    deleteCredentials,
    loadCredentials
  }

  return <BedrockContext.Provider value={value}>{children}</BedrockContext.Provider>
}
