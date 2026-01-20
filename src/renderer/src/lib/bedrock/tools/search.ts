/**
 * Search Tool - Perform web searches
 */

import type { BedrockToolSpec } from '../types'
import type { SearchWebInput, ToolResult } from './types'

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
