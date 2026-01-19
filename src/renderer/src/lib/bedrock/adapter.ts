/**
 * AWS Bedrock Converse API Adapter
 * HTTP-based adapter for calling Bedrock from renderer process
 */

import type {
  BedrockAdapterConfig,
  BedrockConverseRequest,
  BedrockConverseResponse,
  BedrockMessage,
  BedrockToolConfig
} from './types'

export class BedrockAdapter {
  private readonly bearerToken: string
  private readonly region: string
  private readonly modelId: string

  constructor(config: BedrockAdapterConfig) {
    this.bearerToken = config.bearerToken
    this.region = config.region
    this.modelId = config.modelId
  }

  /**
   * Build the Bedrock endpoint URL
   */
  private getEndpoint(): string {
    return `https://bedrock-runtime.${this.region}.amazonaws.com/model/${this.modelId}/converse`
  }

  /**
   * Call Bedrock Converse API (non-streaming)
   */
  async callConverseAPI(request: BedrockConverseRequest): Promise<BedrockConverseResponse> {
    const endpoint = this.getEndpoint()

    console.log('[BEDROCK-ADAPTER] Calling Converse API:', {
      endpoint,
      messagesCount: request.messages.length,
      hasTools: !!request.toolConfig?.tools?.length
    })

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.bearerToken}`,
          Accept: 'application/json'
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[BEDROCK-ADAPTER] API error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        })
        throw new Error(
          `Bedrock API error: ${response.status} ${response.statusText}\n${errorText}`
        )
      }

      const data = (await response.json()) as BedrockConverseResponse

      console.log('[BEDROCK-ADAPTER] Response received:', {
        stopReason: data.stopReason,
        tokensUsed: data.usage.totalTokens,
        hasContent: data.output.message.content.length > 0
      })

      return data
    } catch (error) {
      console.error('[BEDROCK-ADAPTER] Request failed:', error)
      throw error
    }
  }

  /**
   * Build a simple message for testing
   */
  buildSimpleRequest(userMessage: string, systemPrompt?: string): BedrockConverseRequest {
    const messages: BedrockMessage[] = [
      {
        role: 'user',
        content: [{ text: userMessage }]
      }
    ]

    const request: BedrockConverseRequest = {
      messages,
      inferenceConfig: {
        maxTokens: 4096,
        temperature: 1.0
      }
    }

    if (systemPrompt) {
      request.system = [{ text: systemPrompt }]
    }

    return request
  }

  /**
   * Add tool configuration to a request
   */
  addToolConfig(request: BedrockConverseRequest, toolConfig: BedrockToolConfig): void {
    request.toolConfig = toolConfig
  }

  /**
   * Extract text from response
   */
  extractText(response: BedrockConverseResponse): string {
    const textBlocks = response.output.message.content.filter((block) => 'text' in block)
    return textBlocks.map((block) => ('text' in block ? block.text : '')).join('')
  }

  /**
   * Extract tool uses from response
   */
  extractToolUses(response: BedrockConverseResponse) {
    return response.output.message.content
      .filter((block) => 'toolUse' in block)
      .map((block) => ('toolUse' in block ? block.toolUse : null))
      .filter((toolUse) => toolUse !== null)
  }
}
