/**
 * Types for Bedrock Agent Hook
 */

import type { BedrockMessage, ToolExecution } from '../../lib/bedrock/types'

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
