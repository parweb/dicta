/**
 * Bedrock Tools Registry
 * Centralized access to all tools
 */

import type { BedrockToolSpec } from '../types'
import type { ToolResult } from './types'
import { addToCalendarTool, executeAddToCalendar } from './calendar'
import { saveAsNoteTool, executeSaveAsNote } from './notes'
import { sendEmailTool, executeSendEmail } from './email'
import { searchWebTool, executeSearchWeb } from './search'

// Re-export types
export * from './types'

/**
 * Get all available tools for the agent
 */
export function getAllTools(): BedrockToolSpec[] {
  return [addToCalendarTool, saveAsNoteTool, sendEmailTool, searchWebTool]
}

/**
 * Get tool by name
 */
export function getToolByName(name: string): BedrockToolSpec | undefined {
  const tools = getAllTools()
  return tools.find((tool) => tool.toolSpec.name === name)
}

/**
 * Execute a tool by name with dynamic input
 */
export async function executeTool(
  toolName: string,
  input: Record<string, unknown>
): Promise<ToolResult> {
  switch (toolName) {
    case 'add_to_calendar':
      return executeAddToCalendar(input as any)
    case 'save_as_note':
      return executeSaveAsNote(input as any)
    case 'send_email':
      return executeSendEmail(input as any)
    case 'search_web':
      return executeSearchWeb(input as any)
    default:
      return {
        success: false,
        message: `Unknown tool: ${toolName}`,
        error: 'Tool not implemented'
      }
  }
}
