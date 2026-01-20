/**
 * Transcription API Hook
 * React hook for audio transcription with multi-proxy support
 */

import { useState, useCallback } from 'react'

import type { Transcription } from '../lib/history'
import { analyzeAudio as analyzeAudioUtil } from './transcription-api/audio-analyzer'
import { saveToHistory as saveToHistoryUtil } from './transcription-api/history-saver'
import { transcribeAudio as transcribeAudioUtil } from './transcription-api/transcription-fetcher'
import type { ProxyStatus, TranscriptionResult } from './transcription-api/types'
import { INITIAL_PROXY_STATUSES } from './transcription-api/types'

// Re-export types for convenience
export type { ProxyStatus, ProxyConfig, TranscriptionResult } from './transcription-api/types'

export interface UseTranscriptionAPIReturn {
  transcribeAudio: (
    blob: Blob,
    durationMs?: number,
    audioAmplitudes?: number[]
  ) => Promise<TranscriptionResult>
  proxyStatuses: Record<string, ProxyStatus>
  isLoading: boolean
  saveToHistory: (
    text: string,
    durationMs?: number,
    audioAmplitudes?: number[]
  ) => Promise<Transcription | undefined>
  analyzeAudio: (blob: Blob) => Promise<{ durationMs?: number; amplitudes: number[] }>
}

export function useTranscriptionAPI(
  apiKey: string | null,
  onHistoryUpdate?: () => Promise<void>
): UseTranscriptionAPIReturn {
  const [proxyStatuses, setProxyStatuses] =
    useState<Record<string, ProxyStatus>>(INITIAL_PROXY_STATUSES)
  const [isLoading, setIsLoading] = useState(false)

  // Audio analysis
  const analyzeAudio = useCallback(analyzeAudioUtil, [])

  // Save to history
  const saveToHistory = useCallback(
    async (
      text: string,
      durationMs?: number,
      audioAmplitudes?: number[]
    ): Promise<Transcription | undefined> => {
      return saveToHistoryUtil(text, onHistoryUpdate, durationMs, audioAmplitudes)
    },
    [onHistoryUpdate]
  )

  // Transcribe audio
  const transcribeAudio = useCallback(
    async (
      blob: Blob,
      durationMs?: number,
      audioAmplitudes?: number[]
    ): Promise<TranscriptionResult> => {
      return transcribeAudioUtil(
        blob,
        apiKey,
        setIsLoading,
        setProxyStatuses,
        onHistoryUpdate,
        durationMs,
        audioAmplitudes
      )
    },
    [apiKey, onHistoryUpdate]
  )

  return {
    transcribeAudio,
    proxyStatuses,
    isLoading,
    saveToHistory,
    analyzeAudio
  }
}
