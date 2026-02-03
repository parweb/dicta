/**
 * Tool Executor for Bedrock Agent
 * Handles tool execution and result formatting
 */

import { executeTool } from '../../lib/bedrock/tools';
import type {
  BedrockContentBlock,
  BedrockToolUseBlock
} from '../../lib/bedrock/types';
import type { AgentState } from './types';

/**
 * Execute a single tool and return formatted result
 */
export async function executeToolUse(
  toolUse: BedrockToolUseBlock['toolUse'],
  setState: React.Dispatch<React.SetStateAction<AgentState>>,
  addLog: (message: string) => void
): Promise<BedrockContentBlock> {
  addLog(`[TOOL-EXECUTOR] Executing tool: ${toolUse.name}`);

  // Mark tool as running
  setState(prev => ({
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
  }));

  // Execute tool
  const result = await executeTool(toolUse.name, toolUse.input);
  addLog(
    `[TOOL-EXECUTOR] Tool ${toolUse.name}: ${result.success ? '✓ success' : '✗ error'}`
  );

  // Mark tool as complete
  setState(prev => ({
    ...prev,
    toolsExecuted: prev.toolsExecuted.map(t =>
      t.id === toolUse.toolUseId
        ? {
            ...t,
            status: result.success ? 'success' : 'error',
            result: result.message,
            error: result.error
          }
        : t
    )
  }));

  // Return formatted tool result
  return {
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
  };
}

/**
 * Execute all tool uses and collect results
 */
export async function executeToolUses(
  toolUses: BedrockToolUseBlock['toolUse'][],
  setState: React.Dispatch<React.SetStateAction<AgentState>>,
  addLog: (message: string) => void
): Promise<BedrockContentBlock[]> {
  addLog(`[TOOL-EXECUTOR] Executing ${toolUses.length} tools`);

  const toolResults: BedrockContentBlock[] = [];

  for (const toolUse of toolUses) {
    const result = await executeToolUse(toolUse, setState, addLog);
    toolResults.push(result);
  }

  return toolResults;
}
