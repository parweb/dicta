/**
 * Transcription API Hook
 * React hook for audio transcription with multi-proxy support
 */

import { useState, useCallback } from 'react'

import type { Transcription } from '../lib/history'
import {
  DEFAULT_OFFLINE_MODEL_ID,
  DEFAULT_TRANSCRIPTION_MODE,
  type OfflineModelId,
  type TranscriptionMode
} from '../lib/transcription-models'
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
    audioAmplitudes?: number[],
    skipHistorySave?: boolean
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
  onHistoryUpdate?: () => Promise<void>,
  transcriptionMode: TranscriptionMode = DEFAULT_TRANSCRIPTION_MODE,
  offlineModelId: OfflineModelId = DEFAULT_OFFLINE_MODEL_ID
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
      audioAmplitudes?: number[],
      skipHistorySave?: boolean
    ): Promise<TranscriptionResult> => {
      return transcribeAudioUtil(
        blob,
        apiKey,
        setIsLoading,
        setProxyStatuses,
        onHistoryUpdate,
        transcriptionMode,
        offlineModelId,
        durationMs,
        audioAmplitudes,
        skipHistorySave
      )
    },
    [apiKey, onHistoryUpdate, transcriptionMode, offlineModelId]
  )

  return {
    transcribeAudio,
    proxyStatuses,
    isLoading,
    saveToHistory,
    analyzeAudio
  }
}
