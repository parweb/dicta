import { useAtom, useAtomValue } from 'jotai'

import { offlineModelIdAtom, requiresApiKeyAtom, transcriptionModeAtom } from '@/lib/store'

export function useTranscriptionSettings() {
  const [transcriptionMode, setTranscriptionMode] = useAtom(transcriptionModeAtom)
  const [offlineModelId, setOfflineModelId] = useAtom(offlineModelIdAtom)
  const requiresApiKey = useAtomValue(requiresApiKeyAtom)

  return {
    transcriptionMode,
    setTranscriptionMode,
    offlineModelId,
    setOfflineModelId,
    requiresApiKey
  }
}
