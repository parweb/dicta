/**
 * Email Tool - Create draft emails
 */

import type { BedrockToolSpec } from '../types'
import type { SendEmailInput, ToolResult } from './types'

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
