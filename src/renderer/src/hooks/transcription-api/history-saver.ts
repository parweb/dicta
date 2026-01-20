/**
 * History Saver
 * Save transcriptions to history
 */

import type { Transcription } from '../../lib/history'

/**
 * Save transcription to history
 */
export async function saveToHistory(
  text: string,
  onHistoryUpdate?: () => Promise<void>,
  durationMs?: number,
  audioAmplitudes?: number[]
): Promise<Transcription | undefined> {
  try {
    const transcription: Transcription = {
      id: `${Date.now()}`,
      text,
      timestamp: Date.now(),
      durationMs,
      audioAmplitudes
    }
    await window.api?.history.save(transcription)

    // Trigger history reload if callback provided
    if (onHistoryUpdate) {
      await onHistoryUpdate()
    }

    return transcription
  } catch (error) {
    console.error('Error saving to history:', error)
    return undefined
  }
}
