/**
 * AWS Event Stream Parser for Bedrock Converse API
 * Handles binary event stream format used by AWS services
 */

import { EventStreamCodec } from '@smithy/eventstream-codec'
import { fromUtf8, toUtf8 } from '@smithy/util-utf8'

import type { BedrockStreamEvent } from './types'

/**
 * Callback functions for stream events
 */
export interface StreamCallbacks {
  onTextDelta?: (text: string) => void
  onToolUse?: (toolUseId: string, toolName: string, input: Record<string, unknown>) => void
  onComplete?: (stopReason: string, usage?: { inputTokens: number; outputTokens: number; totalTokens: number }) => void
  onError?: (error: Error) => void
}

/**
 * State for accumulating streamed data
 */
interface StreamState {
  currentText: string
  currentToolUseId: string | null
  currentToolName: string | null
  currentToolInput: string
  stopReason: string | null
  usage: { inputTokens: number; outputTokens: number; totalTokens: number } | null
}

/**
 * Parse AWS Event Stream from Bedrock Converse API
 */
export class BedrockStreamParser {
  private codec: EventStreamCodec
  private state: StreamState
  private callbacks: StreamCallbacks

  constructor(callbacks: StreamCallbacks = {}) {
    this.codec = new EventStreamCodec(toUtf8, fromUtf8)
    this.callbacks = callbacks
    this.state = {
      currentText: '',
      currentToolUseId: null,
      currentToolName: null,
      currentToolInput: '',
      stopReason: null,
      usage: null
    }
  }

  /**
   * Process binary event stream chunk
   */
  async processChunk(chunk: Uint8Array): Promise<void> {
    try {
      // Decode the binary message
      const message = this.codec.decode(chunk)

      // Extract event type from headers
      const eventType = message.headers[':event-type']?.value as string | undefined
      const messageType = message.headers[':message-type']?.value as string | undefined

      // Handle error events
      if (messageType === 'error' || messageType === 'exception') {
        const errorCode = message.headers[':error-code']?.value as string | undefined
        const errorMessage = message.headers[':error-message']?.value as string | undefined
        throw new Error(`Bedrock stream error: ${errorCode} - ${errorMessage}`)
      }

      // Skip non-event messages
      if (messageType !== 'event' || !eventType) {
        return
      }

      // Parse JSON payload
      const bodyText = fromUtf8(message.body)
      const event = JSON.parse(bodyText) as BedrockStreamEvent

      // Handle event based on type
      await this.handleEvent(eventType, event)
    } catch (error) {
      console.error('[STREAM-PARSER] Error processing chunk:', error)
      this.callbacks.onError?.(error instanceof Error ? error : new Error(String(error)))
    }
  }

  /**
   * Handle individual event
   */
  private async handleEvent(eventType: string, event: BedrockStreamEvent): Promise<void> {
    switch (eventType) {
      case 'messageStart':
        console.log('[STREAM-PARSER] Message started')
        break

      case 'contentBlockStart':
        if (event.contentBlockStart) {
          const { start } = event.contentBlockStart
          if ('text' in start) {
            // Text content block starting
            this.state.currentText = ''
          } else if ('toolUse' in start) {
            // Tool use block starting
            this.state.currentToolUseId = start.toolUse.toolUseId
            this.state.currentToolName = start.toolUse.name
            this.state.currentToolInput = ''
            console.log('[STREAM-PARSER] Tool use started:', start.toolUse.name)
          }
        }
        break

      case 'contentBlockDelta':
        if (event.contentBlockDelta) {
          const { delta } = event.contentBlockDelta
          if ('text' in delta) {
            // Text delta
            this.state.currentText += delta.text
            this.callbacks.onTextDelta?.(delta.text)
          } else if ('toolUse' in delta) {
            // Tool input delta (JSON fragments)
            this.state.currentToolInput += delta.toolUse.input
          }
        }
        break

      case 'contentBlockStop':
        // Block complete - emit tool use if we were accumulating one
        if (this.state.currentToolUseId && this.state.currentToolName) {
          try {
            const input = JSON.parse(this.state.currentToolInput) as Record<string, unknown>
            this.callbacks.onToolUse?.(
              this.state.currentToolUseId,
              this.state.currentToolName,
              input
            )
            console.log('[STREAM-PARSER] Tool use complete:', {
              id: this.state.currentToolUseId,
              name: this.state.currentToolName,
              input
            })
          } catch (error) {
            console.error('[STREAM-PARSER] Error parsing tool input:', error)
          }
          // Reset tool state
          this.state.currentToolUseId = null
          this.state.currentToolName = null
          this.state.currentToolInput = ''
        }
        break

      case 'messageStop':
        if (event.messageStop) {
          this.state.stopReason = event.messageStop.stopReason
          console.log('[STREAM-PARSER] Message stopped:', event.messageStop.stopReason)
        }
        break

      case 'metadata':
        if (event.metadata) {
          this.state.usage = event.metadata.usage
          console.log('[STREAM-PARSER] Metadata:', {
            usage: event.metadata.usage,
            latency: event.metadata.metrics?.latencyMs
          })
          // Emit completion with metadata
          if (this.state.stopReason) {
            this.callbacks.onComplete?.(this.state.stopReason, this.state.usage)
          }
        }
        break

      default:
        console.warn('[STREAM-PARSER] Unknown event type:', eventType)
    }
  }

  /**
   * Get accumulated text
   */
  getAccumulatedText(): string {
    return this.state.currentText
  }

  /**
   * Get final usage stats
   */
  getUsage() {
    return this.state.usage
  }

  /**
   * Reset parser state
   */
  reset(): void {
    this.state = {
      currentText: '',
      currentToolUseId: null,
      currentToolName: null,
      currentToolInput: '',
      stopReason: null,
      usage: null
    }
  }
}

/**
 * Process a ReadableStream from Bedrock
 */
export async function processBedrockStream(
  stream: ReadableStream<Uint8Array>,
  callbacks: StreamCallbacks
): Promise<void> {
  const parser = new BedrockStreamParser(callbacks)
  const reader = stream.getReader()

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) {
        await parser.processChunk(value)
      }
    }
  } finally {
    reader.releaseLock()
  }
}
