/**
 * Types for Bedrock Agent Hook
 */

import type { BedrockMessage, ToolExecution } from '../../lib/bedrock/types';

// Agent hook state
export interface AgentState {
  isStreaming: boolean;
  response: string;
  toolsExecuted: ToolExecution[];
  error: string | null;
  isComplete: boolean;
  isConversationMode: boolean;
  logs: string[];
}

// Conversation history for restoring state
export interface ConversationHistory {
  messages: BedrockMessage[];
  systemPrompt: string;
  lastResponse: string;
  toolsExecuted: ToolExecution[];
}

// Agent hook return type
export interface UseBedrockAgentReturn {
  state: AgentState;
  conversationMessages: BedrockMessage[];
  systemPrompt: string;
  executeAgent: (prompt: string, transcriptContext?: string) => Promise<void>;
  continueConversation: (followUpPrompt: string) => Promise<void>;
  loadHistory: (history: ConversationHistory) => void;
  getHistory: () => ConversationHistory;
  reset: () => void;
}
