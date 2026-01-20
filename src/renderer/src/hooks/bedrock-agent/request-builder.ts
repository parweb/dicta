/**
 * Request Builder for Bedrock Agent
 * Builds system prompts and initial messages
 */

import type { BedrockMessage } from '../../lib/bedrock/types'

/**
 * Build system prompt with optional transcript context
 */
export function buildSystemPrompt(transcriptContext?: string): string {
  const basePrompt = `Tu es un assistant qui aide à agir sur des transcriptions vocales.
Tu as accès à des outils pour ajouter des événements au calendrier, sauvegarder des notes, envoyer des emails, et rechercher sur le web.
Utilise ces outils de manière appropriée en fonction de la demande de l'utilisateur.`

  if (transcriptContext) {
    return `${basePrompt}\n\nContexte de la transcription:\n"${transcriptContext}"`
  }

  return basePrompt
}

/**
 * Build initial user message
 */
export function buildInitialMessage(prompt: string): BedrockMessage {
  return {
    role: 'user',
    content: [{ text: prompt }]
  }
}
