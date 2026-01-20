/**
 * Transcription API Types
 * Type definitions and constants for transcription
 */

export type ProxyStatus = 'idle' | 'loading' | 'success' | 'error' | 'cancelled'

export interface ProxyConfig {
  name: string
  url: string
}

export interface TranscriptionResponse {
  text: string
}

export interface TranscriptionResult {
  text?: string
  error?: string
  id?: string // ID of the saved transcription
}

export const PROXY_CONFIGS: ProxyConfig[] = [
  {
    name: 'corsfix',
    url: 'https://proxy.corsfix.com/?https://api.openai.com/v1/audio/transcriptions'
  },
  {
    name: 'corsproxy',
    url: 'https://corsproxy.io/?https://api.openai.com/v1/audio/transcriptions'
  }
]

export const INITIAL_PROXY_STATUSES: Record<string, ProxyStatus> = PROXY_CONFIGS.reduce(
  (acc, proxy) => ({ ...acc, [proxy.name]: 'idle' as ProxyStatus }),
  {}
)
