/**
 * Notes Tool - Save content as markdown notes
 */

import type { BedrockToolSpec } from '../types'
import type { SaveAsNoteInput, ToolResult } from './types'

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
