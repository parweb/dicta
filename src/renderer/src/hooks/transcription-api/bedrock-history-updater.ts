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
  bedrockHistory: BedrockConversationHistory
): Promise<void> {
  try {
    console.log('[BEDROCK-HISTORY-UPDATER] Updating transcription:', transcriptionId)

    // Load all transcriptions
    const result = await window.api?.history.loadAll()
    const allTranscriptions = result?.transcriptions || []

    console.log('[BEDROCK-HISTORY-UPDATER] Loaded transcriptions:', allTranscriptions.length)

    // Find the transcription to update
    const transcription = (allTranscriptions as Transcription[]).find((t) => t.id === transcriptionId)

    if (transcription) {
      console.log('[BEDROCK-HISTORY-UPDATER] Found transcription, updating with bedrockHistory')
      // Update with bedrock history
      const updatedTranscription: Transcription = {
        ...transcription,
        bedrockHistory
      }

      // Save back to history
      await window.api?.history.save(updatedTranscription)
      console.log('[BEDROCK-HISTORY-UPDATER] Transcription saved successfully')

      // Note: We don't need to reload all transcriptions here
      // The file is updated on disk and will be loaded when needed
    } else {
      console.warn('[BEDROCK-HISTORY-UPDATER] Transcription not found:', transcriptionId)
    }
  } catch (error) {
    console.error('[BEDROCK-HISTORY-UPDATER] Error updating transcription with Bedrock history:', error)
  }
}
