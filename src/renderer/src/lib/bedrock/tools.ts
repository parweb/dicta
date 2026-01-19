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
