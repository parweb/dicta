/**
 * Bedrock Agent Tools Definitions
 * Four MVP tools for acting on transcriptions
 */

import type { BedrockToolSpec } from './types'

// ===== Tool Input Types =====

export interface AddToCalendarInput {
  title: string
  startTime: string // ISO 8601 format
  endTime?: string // ISO 8601 format, optional
  description?: string
}

export interface SaveAsNoteInput {
  title: string
  content: string
  folder?: string // Optional subfolder
}

export interface SendEmailInput {
  to?: string // Optional recipient
  subject: string
  body: string
}

export interface SearchWebInput {
  query: string
}

// ===== Tool Result Type =====

export interface ToolResult {
  success: boolean
  message: string
  error?: string
}

// ===== Tool Specifications =====

/**
 * Add event to macOS Calendar
 */
export const addToCalendarTool: BedrockToolSpec = {
  toolSpec: {
    name: 'add_to_calendar',
    description:
      'Add an event to the macOS Calendar. Use this to create calendar entries based on transcription content. The startTime and endTime must be in ISO 8601 format.',
    inputSchema: {
      json: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'The title/summary of the calendar event'
          },
          startTime: {
            type: 'string',
            description:
              'Start time in ISO 8601 format (e.g., 2024-01-20T14:00:00Z or 2024-01-20T14:00:00+01:00)'
          },
          endTime: {
            type: 'string',
            description:
              'End time in ISO 8601 format. If not provided, defaults to 1 hour after start.'
          },
          description: {
            type: 'string',
            description: 'Optional description or notes for the event'
          }
        },
        required: ['title', 'startTime']
      }
    }
  }
}

/**
 * Save content as a markdown note
 */
export const saveAsNoteTool: BedrockToolSpec = {
  toolSpec: {
    name: 'save_as_note',
    description:
      'Save content as a markdown note file. Use this to persist transcription content or create notes based on the conversation.',
    inputSchema: {
      json: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'The title of the note (will be used as filename)'
          },
          content: {
            type: 'string',
            description: 'The content of the note in markdown format'
          },
          folder: {
            type: 'string',
            description: 'Optional subfolder to organize notes'
          }
        },
        required: ['title', 'content']
      }
    }
  }
}

/**
 * Send or draft an email
 */
export const sendEmailTool: BedrockToolSpec = {
  toolSpec: {
    name: 'send_email',
    description:
      'Create a draft email with the specified content. Opens the default mail client with pre-filled subject and body.',
    inputSchema: {
      json: {
        type: 'object',
        properties: {
          to: {
            type: 'string',
            description: 'Optional recipient email address'
          },
          subject: {
            type: 'string',
            description: 'The email subject line'
          },
          body: {
            type: 'string',
            description: 'The email body content'
          }
        },
        required: ['subject', 'body']
      }
    }
  }
}

/**
 * Search the web
 */
export const searchWebTool: BedrockToolSpec = {
  toolSpec: {
    name: 'search_web',
    description:
      'Perform a web search using the default browser. Use this to look up information related to the transcription.',
    inputSchema: {
      json: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search query to look up'
          }
        },
        required: ['query']
      }
    }
  }
}

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

// ===== Tool Execution Functions =====

/**
 * Execute add_to_calendar tool
 */
export async function executeAddToCalendar(input: AddToCalendarInput): Promise<ToolResult> {
  try {
    console.log('[TOOL-EXECUTION] Executing add_to_calendar:', input)
    const result = await window.api?.bedrock.addToCalendar(input)

    if (result?.success) {
      return {
        success: true,
        message: result.message || 'Calendar event created successfully'
      }
    } else {
      return {
        success: false,
        message: 'Failed to create calendar event',
        error: result?.error
      }
    }
  } catch (error) {
    console.error('[TOOL-EXECUTION] Error executing add_to_calendar:', error)
    return {
      success: false,
      message: 'Error creating calendar event',
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * Execute save_as_note tool
 */
export async function executeSaveAsNote(input: SaveAsNoteInput): Promise<ToolResult> {
  try {
    console.log('[TOOL-EXECUTION] Executing save_as_note:', input)
    const result = await window.api?.bedrock.saveNote(input)

    if (result?.success) {
      return {
        success: true,
        message: result.message || 'Note saved successfully'
      }
    } else {
      return {
        success: false,
        message: 'Failed to save note',
        error: result?.error
      }
    }
  } catch (error) {
    console.error('[TOOL-EXECUTION] Error executing save_as_note:', error)
    return {
      success: false,
      message: 'Error saving note',
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * Execute send_email tool
 */
export async function executeSendEmail(input: SendEmailInput): Promise<ToolResult> {
  try {
    console.log('[TOOL-EXECUTION] Executing send_email:', input)
    const result = await window.api?.bedrock.sendEmail(input)

    if (result?.success) {
      return {
        success: true,
        message: result.message || 'Email draft created'
      }
    } else {
      return {
        success: false,
        message: 'Failed to create email draft',
        error: result?.error
      }
    }
  } catch (error) {
    console.error('[TOOL-EXECUTION] Error executing send_email:', error)
    return {
      success: false,
      message: 'Error creating email draft',
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * Execute search_web tool
 */
export async function executeSearchWeb(input: SearchWebInput): Promise<ToolResult> {
  try {
    console.log('[TOOL-EXECUTION] Executing search_web:', input)
    const result = await window.api?.bedrock.searchWeb(input)

    if (result?.success) {
      return {
        success: true,
        message: result.message || 'Web search opened'
      }
    } else {
      return {
        success: false,
        message: 'Failed to open web search',
        error: result?.error
      }
    }
  } catch (error) {
    console.error('[TOOL-EXECUTION] Error executing search_web:', error)
    return {
      success: false,
      message: 'Error opening web search',
      error: error instanceof Error ? error.message : String(error)
    }
  }
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
      return executeAddToCalendar(input as AddToCalendarInput)
    case 'save_as_note':
      return executeSaveAsNote(input as SaveAsNoteInput)
    case 'send_email':
      return executeSendEmail(input as SendEmailInput)
    case 'search_web':
      return executeSearchWeb(input as SearchWebInput)
    default:
      return {
        success: false,
        message: `Unknown tool: ${toolName}`,
        error: 'Tool not implemented'
      }
  }
}
