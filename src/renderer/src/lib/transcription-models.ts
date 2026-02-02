export type TranscriptionMode = 'openai' | 'offline'

export type OfflineModelId =
  | 'whisper-small'
  | 'whisper-medium'
  | 'whisper-large-turbo'
  | 'whisper-large'
  | 'parakeet-v2'
  | 'parakeet-v3'

export interface OfflineModelOption {
  id: OfflineModelId
  label: string
  engine: 'Whisper.cpp' | 'Parakeet'
  size: string
}

export const DEFAULT_TRANSCRIPTION_MODE: TranscriptionMode = 'openai'
export const DEFAULT_OFFLINE_MODEL_ID: OfflineModelId = 'whisper-small'

export const OFFLINE_MODEL_OPTIONS: OfflineModelOption[] = [
  {
    id: 'whisper-small',
    label: 'Whisper Small',
    engine: 'Whisper.cpp',
    size: '~487 MB'
  },
  {
    id: 'whisper-medium',
    label: 'Whisper Medium',
    engine: 'Whisper.cpp',
    size: '~492 MB'
  },
  {
    id: 'whisper-large-turbo',
    label: 'Whisper Large Turbo',
    engine: 'Whisper.cpp',
    size: '~1.6 GB'
  },
  {
    id: 'whisper-large',
    label: 'Whisper Large',
    engine: 'Whisper.cpp',
    size: '~1.1 GB'
  },
  {
    id: 'parakeet-v2',
    label: 'Parakeet TDT v2',
    engine: 'Parakeet',
    size: '~473 MB'
  },
  {
    id: 'parakeet-v3',
    label: 'Parakeet TDT v3',
    engine: 'Parakeet',
    size: '~478 MB'
  }
]

export const OFFLINE_MODEL_LABELS: Record<OfflineModelId, string> =
  OFFLINE_MODEL_OPTIONS.reduce(
    (acc, model) => {
      acc[model.id] = model.label
      return acc
    },
    {} as Record<OfflineModelId, string>
  )
