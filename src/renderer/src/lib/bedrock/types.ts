/**
 * Types for AWS Bedrock Converse API integration
 */

// ===== Bedrock API Request/Response Types =====

export interface BedrockMessage {
  role: 'user' | 'assistant'
  content: BedrockContentBlock[]
}

export type BedrockContentBlock =
  | BedrockTextBlock
  | BedrockToolUseBlock
  | BedrockToolResultBlock

export interface BedrockTextBlock {
  text: string
}

export interface BedrockToolUseBlock {
  toolUse: {
    toolUseId: string
    name: string
    input: Record<string, unknown>
  }
}

export interface BedrockToolResultBlock {
  toolResult: {
    toolUseId: string
    content: Array<{ text: string }>
    status?: 'success' | 'error'
  }
}

export interface BedrockSystemBlock {
  text: string
}

export interface BedrockToolSpec {
  toolSpec: {
    name: string
    description: string
    inputSchema: {
      json: {
        type: 'object'
        properties: Record<string, unknown>
        required?: string[]
      }
    }
  }
}

export interface BedrockToolConfig {
  tools: BedrockToolSpec[]
  toolChoice?: {
    auto?: Record<string, never>
    any?: Record<string, never>
    tool?: { name: string }
  }
}

export interface BedrockInferenceConfig {
  maxTokens: number
  temperature?: number
  topP?: number
  stopSequences?: string[]
}

export interface BedrockConverseRequest {
  messages: BedrockMessage[]
  system?: BedrockSystemBlock[]
  toolConfig?: BedrockToolConfig
  inferenceConfig?: BedrockInferenceConfig
}

export interface BedrockConverseResponse {
  output: {
    message: BedrockMessage
  }
  stopReason: 'end_turn' | 'tool_use' | 'max_tokens' | 'stop_sequence'
  usage: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
  }
  metrics?: {
    latencyMs: number
  }
}

// ===== Event Stream Types =====

export interface BedrockStreamEvent {
  messageStart?: {
    role: 'assistant'
  }
  contentBlockStart?: {
    start:
      | { text: string }
      | {
          toolUse: {
            toolUseId: string
            name: string
          }
        }
    contentBlockIndex: number
  }
  contentBlockDelta?: {
    delta:
      | { text: string }
      | {
          toolUse: {
            input: string
          }
        }
    contentBlockIndex: number
  }
  contentBlockStop?: {
    contentBlockIndex: number
  }
  messageStop?: {
    stopReason: 'end_turn' | 'tool_use' | 'max_tokens' | 'stop_sequence'
  }
  metadata?: {
    usage: {
      inputTokens: number
      outputTokens: number
      totalTokens: number
    }
    metrics: {
      latencyMs: number
    }
  }
}

// ===== Tool Execution Types =====

export interface ToolExecutionResult {
  toolUseId: string
  success: boolean
  result?: string
  error?: string
}

export type ToolExecutionStatus = 'pending' | 'running' | 'success' | 'error'

export interface ToolExecution {
  id: string
  name: string
  input: Record<string, unknown>
  status: ToolExecutionStatus
  result?: string
  error?: string
}

// ===== Adapter Types =====

export interface BedrockAdapterConfig {
  bearerToken: string
  region: string
  modelId: string
}

export interface BedrockAdapterCallbacks {
  onTextDelta?: (text: string) => void
  onToolUse?: (toolUse: ToolExecution) => void
  onToolResult?: (result: ToolExecutionResult) => void
  onComplete?: (response: BedrockConverseResponse) => void
  onError?: (error: Error) => void
}

// ===== Credentials Storage Types =====

export interface BedrockCredentials {
  bearerToken: string
  region: string
  modelId: string
}

// ===== Context Types =====

export interface BedrockContextValue {
  credentials: BedrockCredentials | null
  hasCredentials: boolean
  isLoading: boolean
  isEncryptionAvailable: boolean
  saveCredentials: (credentials: BedrockCredentials) => Promise<void>
  deleteCredentials: () => Promise<void>
  loadCredentials: () => Promise<void>
}
