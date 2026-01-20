/**
 * Bedrock History Updater
 * Update transcription with Bedrock conversation history
 */

import type { BedrockConversationHistory, Transcription } from '../../lib/history'

/**
 * Update transcription with Bedrock conversation history
 */
export async function updateTranscriptionWithBedrockHistory(
  transcriptionId: string,
  bedrockHistory: BedrockConversationHistory,
  onHistoryUpdate?: () => Promise<void>
): Promise<void> {
  try {
    // Load all transcriptions
    const allTranscriptions = (await window.api?.history.loadAll()) || []

    // Find and update the transcription
    const updatedTranscriptions = allTranscriptions.map((t: Transcription) => {
      if (t.id === transcriptionId) {
        return {
          ...t,
          bedrockHistory
        }
      }
      return t
    })

    // Find the updated transcription
    const updatedTranscription = updatedTranscriptions.find(
      (t: Transcription) => t.id === transcriptionId
    )

    if (updatedTranscription) {
      // Save back to history
      await window.api?.history.save(updatedTranscription)

      // Trigger history reload if callback provided
      if (onHistoryUpdate) {
        await onHistoryUpdate()
      }
    }
  } catch (error) {
    console.error('Error updating transcription with Bedrock history:', error)
  }
}
