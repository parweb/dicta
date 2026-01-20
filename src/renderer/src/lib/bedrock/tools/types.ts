/**
 * Shared types for Bedrock tools
 */

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

export interface ToolResult {
  success: boolean
  message: string
  error?: string
}
