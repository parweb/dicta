/**
 * React hook for Bedrock Agent interaction
 * Manages streaming agent execution with tool calls
 */

import { useCallback, useState } from 'react'

import { useBedrock } from '../contexts/BedrockContext'
import { BedrockAdapter } from '../lib/bedrock/adapter'
import { getAllTools } from '../lib/bedrock/tools'
import type {
  BedrockConverseRequest,
  BedrockMessage,
  BedrockToolConfig,
  ToolExecution
} from '../lib/bedrock/types'

// Agent hook state
export interface AgentState {
  isStreaming: boolean
  response: string
  toolsExecuted: ToolExecution[]
  error: string | null
  isComplete: boolean
}

// Agent hook return type
export interface UseBedrockAgentReturn {
  state: AgentState
  executeAgent: (prompt: string, transcriptContext?: string) => Promise<void>
  reset: () => void
}

/**
 * Hook for executing Bedrock agent with tools
 */
export function useBedrockAgent(): UseBedrockAgentReturn {
  const { credentials, hasCredentials } = useBedrock()

  const [state, setState] = useState<AgentState>({
    isStreaming: false,
    response: '',
    toolsExecuted: [],
    error: null,
    isComplete: false
  })

  /**
   * Reset agent state
   */
  const reset = useCallback(() => {
    setState({
      isStreaming: false,
      response: '',
      toolsExecuted: [],
      error: null,
      isComplete: false
    })
  }, [])

  /**
   * Execute agent with streaming
   */
  const executeAgent = useCallback(
    async (prompt: string, transcriptContext?: string) => {
      if (!hasCredentials || !credentials) {
        setState((prev) => ({
          ...prev,
          error: 'Bedrock credentials not configured'
        }))
        return
      }

      // Reset state
      setState({
        isStreaming: true,
        response: '',
        toolsExecuted: [],
        error: null,
        isComplete: false
      })

      try {
        // Initialize adapter
        const adapter = new BedrockAdapter({
          bearerToken: credentials.bearerToken,
          region: credentials.region,
          modelId: credentials.modelId
        })

        // Build system prompt
        const systemPrompt = `Tu es un assistant qui aide à agir sur des transcriptions vocales.
Tu as accès à des outils pour ajouter des événements au calendrier, sauvegarder des notes, envoyer des emails, et rechercher sur le web.
Utilise ces outils de manière appropriée en fonction de la demande de l'utilisateur.
${transcriptContext ? `\n\nContexte de la transcription:\n"${transcriptContext}"` : ''}`

        // Build messages
        const messages: BedrockMessage[] = [
          {
            role: 'user',
            content: [{ text: prompt }]
          }
        ]

        // Build tool config
        const toolConfig: BedrockToolConfig = {
          tools: getAllTools(),
          toolChoice: { auto: {} }
        }

        // Build request
        const request: BedrockConverseRequest = {
          messages,
          system: [{ text: systemPrompt }],
          toolConfig,
          inferenceConfig: {
            maxTokens: 4096,
            temperature: 1.0
          }
        }

        console.log('[BEDROCK-AGENT] Starting agent execution')

        // Execute with streaming
        await adapter.callConverseStreamAPI(request, {
          onTextDelta: (text) => {
            setState((prev) => ({
              ...prev,
              response: prev.response + text
            }))
          },
          onToolUse: (toolUseId, toolName, input) => {
            console.log('[BEDROCK-AGENT] Tool use detected:', { toolUseId, toolName, input })
            setState((prev) => ({
              ...prev,
              toolsExecuted: [
                ...prev.toolsExecuted,
                {
                  id: toolUseId,
                  name: toolName,
                  input,
                  status: 'pending'
                }
              ]
            }))
          },
          onComplete: (stopReason, usage) => {
            console.log('[BEDROCK-AGENT] Agent complete:', { stopReason, usage })
            setState((prev) => ({
              ...prev,
              isStreaming: false,
              isComplete: true
            }))
          },
          onError: (error) => {
            console.error('[BEDROCK-AGENT] Agent error:', error)
            setState((prev) => ({
              ...prev,
              isStreaming: false,
              error: error.message
            }))
          }
        })
      } catch (error) {
        console.error('[BEDROCK-AGENT] Execution error:', error)
        setState((prev) => ({
          ...prev,
          isStreaming: false,
          error: error instanceof Error ? error.message : String(error)
        }))
      }
    },
    [hasCredentials, credentials]
  )

  return {
    state,
    executeAgent,
    reset
  }
}
