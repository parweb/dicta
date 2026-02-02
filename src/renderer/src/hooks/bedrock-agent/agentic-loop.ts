/**
 * Agentic Loop for Bedrock Agent
 * Core loop that handles tool orchestration and conversation flow
 */

import type { BedrockAdapter } from '../../lib/bedrock/adapter';
import type {
  BedrockConverseRequest,
  BedrockMessage,
  BedrockToolConfig
} from '../../lib/bedrock/types';
import type { AgentState } from './types';
import { executeToolUses } from './tool-executor';

const MAX_ROUNDS = 10;

/**
 * Run agentic loop with tool orchestration
 */
export async function runAgenticLoop(
  adapter: BedrockAdapter,
  messages: BedrockMessage[],
  systemPrompt: string,
  toolConfig: BedrockToolConfig,
  setState: React.Dispatch<React.SetStateAction<AgentState>>
): Promise<BedrockMessage[]> {
  // Helper to add logs
  const addLog = (message: string) => {
    console.log(message);
    setState(prev => ({
      ...prev,
      logs: [...prev.logs, `${new Date().toISOString()} ${message}`]
    }));
  };

  addLog('[AGENTIC-LOOP] Starting');

  let round = 0;
  let stopReason = '';

  while (round < MAX_ROUNDS) {
    round++;
    addLog(`[AGENTIC-LOOP] Round ${round}/${MAX_ROUNDS}`);

    // Build request
    const request: BedrockConverseRequest = {
      messages,
      system: [{ text: systemPrompt }],
      toolConfig,
      inferenceConfig: {
        maxTokens: 4096,
        temperature: 1.0
      }
    };

    // Call API (non-streaming for simplicity in agentic loop)
    const response = await adapter.callConverseAPI(request);
    stopReason = response.stopReason;

    // Extract text and add to response
    const responseText = adapter.extractText(response);
    if (responseText) {
      setState(prev => ({
        ...prev,
        response: prev.response + responseText
      }));
    }

    // Add assistant message to conversation
    messages.push(response.output.message);

    // Check stop reason
    if (stopReason === 'end_turn') {
      addLog('[AGENTIC-LOOP] Completed naturally');
      break;
    }

    if (stopReason === 'tool_use') {
      // Extract tool uses
      const toolUses = adapter.extractToolUses(response);
      addLog(`[AGENTIC-LOOP] Tool uses detected: ${toolUses.length}`);

      if (toolUses.length === 0) {
        addLog('[AGENTIC-LOOP] ⚠️ stopReason=tool_use but no tools found');
        break;
      }

      // Execute tools and collect results
      const toolResults = await executeToolUses(toolUses, setState, addLog);

      // Add user message with tool results
      messages.push({
        role: 'user',
        content: toolResults
      });

      // Continue loop for next round
      continue;
    }

    // Other stop reasons (max_tokens, stop_sequence, etc.)
    addLog('[AGENTIC-LOOP] Stopped with reason: ' + stopReason);
    break;
  }

  if (round >= MAX_ROUNDS) {
    addLog('[AGENTIC-LOOP] ⚠️ Max rounds reached');
  }

  return messages;
}
