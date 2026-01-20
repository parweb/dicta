/**
 * Calendar Tool - Add events to macOS Calendar
 */

import type { BedrockToolSpec } from '../types'
import type { AddToCalendarInput, ToolResult } from './types'

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
