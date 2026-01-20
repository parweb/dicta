/**
 * Transcription Fetcher
 * Handle transcription API calls with multi-proxy racing
 */

import type {
  ProxyConfig,
  ProxyStatus,
  TranscriptionResponse,
  TranscriptionResult
} from './types'
import { PROXY_CONFIGS } from './types'
import { saveToHistory } from './history-saver'

/**
 * Fetch transcription with a specific proxy
 */
async function fetchWithProxy(
  proxy: ProxyConfig,
  apiKey: string,
  formData: FormData,
  setProxyStatus: (name: string, status: ProxyStatus) => void
): Promise<TranscriptionResponse> {
  try {
    console.log('[TRANSCRIPTION] Fetching with proxy:', proxy.name)
    console.log('[TRANSCRIPTION] Proxy URL:', proxy.url)
    console.log(
      '[TRANSCRIPTION] Authorization header starts with:',
      `Bearer ${apiKey}`.substring(0, 17)
    )

    const response = await fetch(proxy.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`
      },
      body: formData
    })

    console.log('[TRANSCRIPTION] Response status:', response.status, response.statusText)
    console.log('[TRANSCRIPTION] Response ok:', response.ok)

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      console.error('[TRANSCRIPTION] Error response data:', data)
      setProxyStatus(proxy.name, 'error')
      throw new Error(data.error?.message || `Proxy error: ${proxy.name}`)
    }

    const data: TranscriptionResponse = await response.json()
    console.log('[TRANSCRIPTION] Success! Transcription length:', data.text?.length)
    setProxyStatus(proxy.name, 'success')
    return data
  } catch (error) {
    console.error('[TRANSCRIPTION] Proxy error:', proxy.name, error)
    setProxyStatus(proxy.name, 'error')
    throw error
  }
}

/**
 * Transcribe audio using multiple proxies in race condition
 */
export async function transcribeAudio(
  blob: Blob,
  apiKey: string | null,
  setIsLoading: (loading: boolean) => void,
  setProxyStatuses: React.Dispatch<React.SetStateAction<Record<string, ProxyStatus>>>,
  onHistoryUpdate?: () => Promise<void>,
  durationMs?: number,
  audioAmplitudes?: number[],
  skipHistorySave?: boolean
): Promise<TranscriptionResult> {
  console.log('[TRANSCRIPTION] Starting transcription...')
  console.log('[TRANSCRIPTION] API key present:', !!apiKey)
  console.log('[TRANSCRIPTION] API key length:', apiKey?.length)
  console.log('[TRANSCRIPTION] API key starts with:', apiKey?.substring(0, 7))
  console.log('[TRANSCRIPTION] Blob size:', blob.size, 'bytes')
  console.log('[TRANSCRIPTION] Blob type:', blob.type)

  if (!apiKey) {
    console.error('[TRANSCRIPTION] API key is not configured')
    return {
      error: 'Clé API non configurée. Veuillez ajouter votre clé OpenAI dans les paramètres.'
    }
  }

  setIsLoading(true)

  const formData = new FormData()
  formData.append('file', blob, 'recording.webm')
  formData.append('model', 'gpt-4o-transcribe')
  console.log('[TRANSCRIPTION] FormData prepared with model: gpt-4o-transcribe')

  // Reset proxy statuses to loading
  setProxyStatuses(
    PROXY_CONFIGS.reduce((acc, proxy) => ({ ...acc, [proxy.name]: 'loading' as ProxyStatus }), {})
  )

  // Helper to update single proxy status
  const setProxyStatus = (name: string, status: ProxyStatus) => {
    setProxyStatuses((prev) => ({ ...prev, [name]: status }))
  }

  try {
    // Promise.any() returns the first successful promise
    const data = await Promise.any(
      PROXY_CONFIGS.map((proxy) => fetchWithProxy(proxy, apiKey, formData, setProxyStatus))
    )

    // Mark remaining proxies as cancelled
    setProxyStatuses((prev) => {
      const newStatuses = { ...prev }
      Object.keys(newStatuses).forEach((key) => {
        if (newStatuses[key] === 'loading') {
          newStatuses[key] = 'cancelled'
        }
      })
      return newStatuses
    })

    // Copy to clipboard
    await navigator.clipboard.writeText(data.text)

    // Save to history (unless skip requested)
    let savedTranscription
    if (!skipHistorySave) {
      savedTranscription = await saveToHistory(data.text, onHistoryUpdate, durationMs, audioAmplitudes)
    }

    setIsLoading(false)
    return {
      text: data.text,
      id: savedTranscription?.id
    }
  } catch (error) {
    setIsLoading(false)
    let errorMessage = 'Transcription failed'
    if (error instanceof AggregateError) {
      console.error('All proxies failed:', error.errors)
      errorMessage = 'All transcription proxies failed. Please try again.'
    } else {
      console.error('Transcription error:', error)
    }
    return { error: errorMessage }
  }
}
