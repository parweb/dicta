/**
 * React hook for Bedrock Agent interaction
 * Manages streaming agent execution with tool calls
 */

import { useCallback, useState } from 'react';

import { useBedrock } from '../contexts/BedrockContext';
import { BedrockAdapter } from '../lib/bedrock/adapter';
import { getAllTools } from '../lib/bedrock/tools';
import type { BedrockMessage, BedrockToolConfig } from '../lib/bedrock/types';
import { runAgenticLoop } from './bedrock-agent/agentic-loop';
import {
  buildInitialMessage,
  buildSystemPrompt
} from './bedrock-agent/request-builder';
import type {
  AgentState,
  ConversationHistory,
  UseBedrockAgentReturn
} from './bedrock-agent/types';

// Re-export types for convenience
export type {
  AgentState,
  ConversationHistory,
  UseBedrockAgentReturn
} from './bedrock-agent/types';

/**
 * Hook for executing Bedrock agent with tools
 */
export function useBedrockAgent(): UseBedrockAgentReturn {
  const { credentials, hasCredentials } = useBedrock();

  const [state, setState] = useState<AgentState>({
    isStreaming: false,
    response: '',
    toolsExecuted: [],
    error: null,
    isComplete: false,
    isConversationMode: false,
    logs: []
  });

  // Persistent conversation state for follow-ups
  const [conversationMessages, setConversationMessages] = useState<
    BedrockMessage[]
  >([]);
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [toolConfig, setToolConfig] = useState<BedrockToolConfig | null>(null);

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
      isConversationMode: false,
      logs: []
    });
    setConversationMessages([]);
    setSystemPrompt('');
    setToolConfig(null);
  }, []);

  /**
   * Execute agent with tool orchestration loop
   */
  const executeAgent = useCallback(
    async (prompt: string, transcriptContext?: string) => {
      if (!hasCredentials || !credentials) {
        setState(prev => ({
          ...prev,
          error: 'Bedrock credentials not configured'
        }));
        return;
      }

      // Reset state (but not conversation for initial call)
      setState({
        isStreaming: true,
        response: '',
        toolsExecuted: [],
        error: null,
        isComplete: false,
        isConversationMode: false,
        logs: []
      });

      try {
        // Initialize adapter
        const adapter = new BedrockAdapter({
          bearerToken: credentials.bearerToken,
          region: credentials.region,
          modelId: credentials.modelId
        });

        // Build system prompt
        const sysPrompt = buildSystemPrompt(transcriptContext);

        // Build initial messages
        const messages: BedrockMessage[] = [buildInitialMessage(prompt)];

        // Build tool config
        const tConfig: BedrockToolConfig = {
          tools: getAllTools(),
          toolChoice: { auto: {} }
        };

        // Save for follow-ups
        setSystemPrompt(sysPrompt);
        setToolConfig(tConfig);

        // Run agentic loop
        const updatedMessages = await runAgenticLoop(
          adapter,
          messages,
          sysPrompt,
          tConfig,
          setState
        );

        // Save conversation state for follow-ups
        setConversationMessages(updatedMessages);

        // Mark complete
        setState(prev => ({
          ...prev,
          isStreaming: false,
          isComplete: true
        }));
      } catch (error) {
        console.error('[BEDROCK-AGENT] Execution error:', error);
        setState(prev => ({
          ...prev,
          isStreaming: false,
          error: error instanceof Error ? error.message : String(error)
        }));
      }
    },
    [hasCredentials, credentials]
  );

  /**
   * Continue conversation with a follow-up prompt
   */
  const continueConversation = useCallback(
    async (followUpPrompt: string) => {
      if (!hasCredentials || !credentials) {
        setState(prev => ({
          ...prev,
          error: 'Bedrock credentials not configured'
        }));
        return;
      }

      if (conversationMessages.length === 0) {
        console.error('[BEDROCK-AGENT] No conversation to continue');
        return;
      }

      // Switch to conversation mode and set streaming state
      setState(prev => ({
        ...prev,
        isStreaming: true,
        isComplete: false,
        isConversationMode: true
      }));

      try {
        // Initialize adapter
        const adapter = new BedrockAdapter({
          bearerToken: credentials.bearerToken,
          region: credentials.region,
          modelId: credentials.modelId
        });

        // Add follow-up message to conversation
        const messages = [
          ...conversationMessages,
          buildInitialMessage(followUpPrompt)
        ];

        // Run agentic loop with existing conversation
        const updatedMessages = await runAgenticLoop(
          adapter,
          messages,
          systemPrompt,
          toolConfig!,
          setState
        );

        // Save updated conversation
        setConversationMessages(updatedMessages);

        // Mark complete
        setState(prev => ({
          ...prev,
          isStreaming: false,
          isComplete: true
        }));
      } catch (error) {
        console.error('[BEDROCK-AGENT] Follow-up error:', error);
        setState(prev => ({
          ...prev,
          isStreaming: false,
          error: error instanceof Error ? error.message : String(error)
        }));
      }
    },
    [
      hasCredentials,
      credentials,
      conversationMessages,
      systemPrompt,
      toolConfig
    ]
  );

  /**
   * Load conversation history (for restoring previous conversations)
   */
  const loadHistory = useCallback((history: ConversationHistory) => {
    setConversationMessages(history.messages);
    setSystemPrompt(history.systemPrompt);
    setState({
      isStreaming: false,
      response: history.lastResponse,
      toolsExecuted: history.toolsExecuted,
      error: null,
      isComplete: true,
      isConversationMode: true,
      logs: [] // No logs for past conversations
    });
    // Recreate tool config
    setToolConfig({
      tools: getAllTools(),
      toolChoice: { auto: {} }
    });
  }, []);

  /**
   * Get current conversation history (for saving)
   */
  const getHistory = useCallback((): ConversationHistory => {
    return {
      messages: conversationMessages,
      systemPrompt,
      lastResponse: state.response,
      toolsExecuted: state.toolsExecuted
    };
  }, [conversationMessages, systemPrompt, state.response, state.toolsExecuted]);

  return {
    state,
    conversationMessages,
    systemPrompt,
    executeAgent,
    continueConversation,
    loadHistory,
    getHistory,
    reset
  };
}
