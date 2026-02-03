/**
 * API Key Store Hook
 * Jotai-based replacement for ApiKeyContext
 */

import { useAtom, useAtomValue } from 'jotai'
import { useCallback, useEffect } from 'react'

import {
  apiKeyAtom,
  hasApiKeyAtom,
  isApiKeyLoadingAtom,
  isEncryptionAvailableAtom
} from '@/lib/store'

export function useApiKeyStore() {
  const [apiKey, setApiKey] = useAtom(apiKeyAtom)
  const [isLoading, setIsLoading] = useAtom(isApiKeyLoadingAtom)
  const [isEncryptionAvailable, setIsEncryptionAvailable] = useAtom(
    isEncryptionAvailableAtom
  )
  const hasApiKey = useAtomValue(hasApiKeyAtom)

  // Load API key from encrypted storage
  const loadApiKey = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await window.api?.credentials.loadApiKey()
      if (result?.success && result.apiKey) {
        setApiKey(result.apiKey)
        console.log('[API KEY STORE] API key loaded successfully')
      } else {
        setApiKey(null)
        console.log('[API KEY STORE] No API key found')
      }
    } catch (error) {
      console.error('[API KEY STORE] Error loading API key:', error)
      setApiKey(null)
    } finally {
      setIsLoading(false)
    }
  }, [setIsLoading, setApiKey])

  // Save API key to encrypted storage
  const saveApiKey = useCallback(
    async (key: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const result = await window.api?.credentials.saveApiKey(key)
        if (result?.success) {
          setApiKey(key)
          console.log('[API KEY STORE] API key saved successfully')
          return { success: true }
        }
        return { success: false, error: result?.error || 'Unknown error' }
      } catch (error) {
        console.error('[API KEY STORE] Error saving API key:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    },
    [setApiKey]
  )

  // Delete API key from encrypted storage
  const deleteApiKey = useCallback(async (): Promise<{
    success: boolean
    error?: string
  }> => {
    try {
      const result = await window.api?.credentials.deleteApiKey()
      if (result?.success) {
        setApiKey(null)
        console.log('[API KEY STORE] API key deleted successfully')
        return { success: true }
      }
      return { success: false, error: result?.error || 'Unknown error' }
    } catch (error) {
      console.error('[API KEY STORE] Error deleting API key:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }, [setApiKey])

  // Check encryption availability on mount
  useEffect(() => {
    const checkEncryption = async () => {
      try {
        const available =
          await window.api?.credentials.checkEncryptionAvailable()
        setIsEncryptionAvailable(available?.available ?? false)
      } catch (error) {
        console.error(
          '[API KEY STORE] Error checking encryption availability:',
          error
        )
      }

      await loadApiKey()
    }

    checkEncryption()
  }, [loadApiKey, setIsEncryptionAvailable])

  return {
    apiKey,
    isLoading,
    hasApiKey,
    isEncryptionAvailable,
    saveApiKey,
    deleteApiKey,
    loadApiKey
  }
}
