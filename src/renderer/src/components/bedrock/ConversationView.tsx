/**
 * Conversation View Component
 * Displays agent conversation in chat format
 */

import { useEffect, useRef } from 'react'
import { Bot, User } from 'lucide-react'

import { useThemeStore } from '@/hooks/useThemeStore'
import type { BedrockMessage } from '../../lib/bedrock/types'
import ToolExecutionStatus from './ToolExecutionStatus'
import type { ToolExecution } from '../../lib/bedrock/types'
import MarkdownRenderer from '../shared/MarkdownRenderer'

interface ConversationViewProps {
  messages: BedrockMessage[]
  toolsExecuted: ToolExecution[]
  isStreaming: boolean
}

export default function ConversationView({
  messages,
  toolsExecuted,
  isStreaming
}: ConversationViewProps) {
  const { theme } = useThemeStore()
  const { colors, spacing, typography } = theme
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, toolsExecuted])

  // Extract text from message content
  const getMessageText = (message: BedrockMessage): string => {
    return message.content
      .filter((block) => 'text' in block)
      .map((block) => ('text' in block ? block.text : ''))
      .join('')
  }

  return (
    <div
      ref={scrollRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.md,
        maxHeight: '500px',
        overflowY: 'auto',
        padding: spacing.md
      }}
    >
      {messages.map((message, index) => {
        const isUser = message.role === 'user'
        const text = getMessageText(message)

        // Skip empty user messages (tool results)
        if (isUser && !text) {
          return null
        }

        return (
          <div
            key={index}
            style={{
              display: 'flex',
              gap: spacing.md,
              alignItems: 'flex-start'
            }}
          >
            {/* Avatar */}
            <div
              style={{
                flexShrink: 0,
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: isUser ? colors.accent.primary.primary : colors.accent.success.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isUser ? (
                <User size={18} color={colors.background.primary} />
              ) : (
                <Bot size={18} color={colors.background.primary} />
              )}
            </div>

            {/* Message bubble */}
            <div
              style={{
                flex: 1,
                padding: spacing.md,
                backgroundColor: isUser
                  ? colors.background.secondary + '40'
                  : colors.background.secondary + '20',
                border: `1px solid ${colors.border.primary}`,
                borderRadius: '8px'
              }}
            >
              <MarkdownRenderer content={text} />
            </div>
          </div>
        )
      })}

      {/* Show streaming indicator */}
      {isStreaming && (
        <div
          style={{
            display: 'flex',
            gap: spacing.md,
            alignItems: 'flex-start'
          }}
        >
          <div
            style={{
              flexShrink: 0,
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: colors.accent.success.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Bot size={18} color={colors.background.primary} />
          </div>
          <div
            style={{
              padding: spacing.md,
              backgroundColor: colors.background.secondary + '20',
              border: `1px solid ${colors.border.primary}`,
              borderRadius: '8px',
              fontSize: typography.fontSize.sm,
              color: colors.text.tertiary
            }}
          >
            L'agent réfléchit...
          </div>
        </div>
      )}

      {/* Tools executed section */}
      {toolsExecuted.length > 0 && (
        <div style={{ marginTop: spacing.md }}>
          <ToolExecutionStatus tools={toolsExecuted} />
        </div>
      )}
    </div>
  )
}
