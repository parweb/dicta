/**
 * React hook for Bedrock Agent interaction
 * Manages streaming agent execution with tool calls
 */

import { useCallback, useState } from 'react'

import { useBedrock } from '../contexts/BedrockContext'
import { BedrockAdapter } from '../lib/bedrock/adapter'
import { executeTool, getAllTools } from '../lib/bedrock/tools'
import type {
  BedrockConverseRequest,
  BedrockContentBlock,
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
  isConversationMode: boolean
}

// Agent hook return type
export interface UseBedrockAgentReturn {
  state: AgentState
  conversationMessages: BedrockMessage[]
  executeAgent: (prompt: string, transcriptContext?: string) => Promise<void>
  continueConversation: (followUpPrompt: string) => Promise<void>
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
    isComplete: false,
    isConversationMode: false
  })

  // Persistent conversation state for follow-ups
  const [conversationMessages, setConversationMessages] = useState<BedrockMessage[]>([])
  const [systemPrompt, setSystemPrompt] = useState<string>('')
  const [toolConfig, setToolConfig] = useState<BedrockToolConfig | null>(null)

  /**
   * Reset agent state
   */
  const reset = useCallback(() => {
    setState({
      isStreaming: false,
      response: '',
      toolsExecuted: [],
      error: null,
      isComplete: false,
      isConversationMode: false
    })
    setConversationMessages([])
    setSystemPrompt('')
    setToolConfig(null)
  }, [])

  /**
   * Internal function to run agentic loop
   */
  const runAgenticLoop = useCallback(
    async (
      adapter: BedrockAdapter,
      messages: BedrockMessage[],
      systemPromptText: string,
      toolConfigObj: BedrockToolConfig
    ) => {
      try {
        console.log('[BEDROCK-AGENT] Starting agentic loop')

        // Agentic loop (max 10 rounds)
        const MAX_ROUNDS = 10
        let round = 0
        let stopReason = ''

        while (round < MAX_ROUNDS) {
          round++
          console.log(`[BEDROCK-AGENT] Round ${round}/${MAX_ROUNDS}`)

          // Build request
          const request: BedrockConverseRequest = {
            messages,
            system: [{ text: systemPromptText }],
            toolConfig: toolConfigObj,
            inferenceConfig: {
              maxTokens: 4096,
              temperature: 1.0
            }
          }

          // Call API (non-streaming for simplicity in agentic loop)
          const response = await adapter.callConverseAPI(request)
          stopReason = response.stopReason

          // Extract text and add to response
          const responseText = adapter.extractText(response)
          if (responseText) {
            setState((prev) => ({
              ...prev,
              response: prev.response + responseText
            }))
          }

          // Add assistant message to conversation
          messages.push(response.output.message)

          // Check stop reason
          if (stopReason === 'end_turn') {
            console.log('[BEDROCK-AGENT] Agent completed naturally')
            break
          }

          if (stopReason === 'tool_use') {
            // Extract tool uses
            const toolUses = adapter.extractToolUses(response)
            console.log(`[BEDROCK-AGENT] Tool uses detected: ${toolUses.length}`)

            if (toolUses.length === 0) {
              console.warn('[BEDROCK-AGENT] stopReason=tool_use but no tools found')
              break
            }

            // Execute tools and collect results
            const toolResults: BedrockContentBlock[] = []

            for (const toolUse of toolUses) {
              // Update state: mark tool as running
              setState((prev) => ({
                ...prev,
                toolsExecuted: [
                  ...prev.toolsExecuted,
                  {
                    id: toolUse.toolUseId,
                    name: toolUse.name,
                    input: toolUse.input,
                    status: 'running'
                  }
                ]
              }))

              // Execute tool
              const result = await executeTool(toolUse.name, toolUse.input)

              // Update state: mark tool as complete
              setState((prev) => ({
                ...prev,
                toolsExecuted: prev.toolsExecuted.map((t) =>
                  t.id === toolUse.toolUseId
                    ? {
                        ...t,
                        status: result.success ? 'success' : 'error',
                        result: result.message,
                        error: result.error
                      }
                    : t
                )
              }))

              // Add tool result to conversation
              toolResults.push({
                toolResult: {
                  toolUseId: toolUse.toolUseId,
                  content: [
                    {
                      text: result.success
                        ? result.message
                        : `Error: ${result.error || 'Unknown error'}`
                    }
                  ],
                  status: result.success ? 'success' : 'error'
                }
              })
            }

            // Add user message with tool results
            messages.push({
              role: 'user',
              content: toolResults
            })

            // Continue loop for next round
            continue
          }

          // Other stop reasons (max_tokens, stop_sequence, etc.)
          console.log('[BEDROCK-AGENT] Stopped with reason:', stopReason)
          break
        }

      if (round >= MAX_ROUNDS) {
        console.warn('[BEDROCK-AGENT] Max rounds reached')
      }

      // Save conversation state for follow-ups
      setConversationMessages(messages)

      // Mark complete
      setState((prev) => ({
        ...prev,
        isStreaming: false,
        isComplete: true
      }))
    } catch (error) {
      console.error('[BEDROCK-AGENT] Loop error:', error)
      setState((prev) => ({
        ...prev,
        isStreaming: false,
        error: error instanceof Error ? error.message : String(error)
      }))
    }
  },
  []
)

  /**
   * Execute agent with tool orchestration loop
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

      // Reset state (but not conversation for initial call)
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
        const sysPrompt = `Tu es un assistant qui aide à agir sur des transcriptions vocales.
Tu as accès à des outils pour ajouter des événements au calendrier, sauvegarder des notes, envoyer des emails, et rechercher sur le web.
Utilise ces outils de manière appropriée en fonction de la demande de l'utilisateur.
${transcriptContext ? `\n\nContexte de la transcription:\n"${transcriptContext}"` : ''}`

        // Build initial messages
        const messages: BedrockMessage[] = [
          {
            role: 'user',
            content: [{ text: prompt }]
          }
        ]

        // Build tool config
        const tConfig: BedrockToolConfig = {
          tools: getAllTools(),
          toolChoice: { auto: {} }
        }

        // Save for follow-ups
        setSystemPrompt(sysPrompt)
        setToolConfig(tConfig)

        // Run agentic loop
        await runAgenticLoop(adapter, messages, sysPrompt, tConfig)
      } catch (error) {
        console.error('[BEDROCK-AGENT] Execution error:', error)
        setState((prev) => ({
          ...prev,
          isStreaming: false,
          error: error instanceof Error ? error.message : String(error)
        }))
      }
    },
    [hasCredentials, credentials, runAgenticLoop]
  )

  /**
   * Continue conversation with a follow-up prompt
   */
  const continueConversation = useCallback(
    async (followUpPrompt: string) => {
      if (!hasCredentials || !credentials) {
        setState((prev) => ({
          ...prev,
          error: 'Bedrock credentials not configured'
        }))
        return
      }

      if (conversationMessages.length === 0) {
        console.error('[BEDROCK-AGENT] No conversation to continue')
        return
      }

      // Switch to conversation mode and set streaming state
      setState((prev) => ({
        ...prev,
        isStreaming: true,
        isComplete: false,
        isConversationMode: true
      }))

      try {
        // Initialize adapter
        const adapter = new BedrockAdapter({
          bearerToken: credentials.bearerToken,
          region: credentials.region,
          modelId: credentials.modelId
        })

        // Add follow-up message to conversation
        const messages = [
          ...conversationMessages,
          {
            role: 'user' as const,
            content: [{ text: followUpPrompt }]
          }
        ]

        // Run agentic loop with existing conversation
        await runAgenticLoop(adapter, messages, systemPrompt, toolConfig!)
      } catch (error) {
        console.error('[BEDROCK-AGENT] Follow-up error:', error)
        setState((prev) => ({
          ...prev,
          isStreaming: false,
          error: error instanceof Error ? error.message : String(error)
        }))
      }
    },
    [
      hasCredentials,
      credentials,
      conversationMessages,
      systemPrompt,
      toolConfig,
      runAgenticLoop
    ]
  )

  return {
    state,
    conversationMessages,
    executeAgent,
    continueConversation,
    reset
  }
}
