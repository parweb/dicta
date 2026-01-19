/**
 * Agent Streaming Display Component
 * Displays agent response text and tool execution status
 */

import { useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'

import { useTheme } from '../../lib/theme-context'
import type { AgentState } from '../../hooks/useBedrockAgent'
import ToolExecutionStatus from './ToolExecutionStatus'

interface AgentStreamingDisplayProps {
  state: AgentState
}

export default function AgentStreamingDisplay({ state }: AgentStreamingDisplayProps) {
  const { theme } = useTheme()
  const { colors, spacing, typography } = theme
  const responseRef = useRef<HTMLDivElement>(null)

  // Auto-scroll when response updates
  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight
    }
  }, [state.response, state.toolsExecuted])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.md
      }}
    >
      {/* Response Text */}
      {(state.response || state.isStreaming) && (
        <div
          ref={responseRef}
          style={{
            padding: spacing.lg,
            backgroundColor: colors.background.secondary + '20',
            border: `1px solid ${colors.border.primary}`,
            borderRadius: '2px',
            fontSize: typography.fontSize.base,
            lineHeight: typography.lineHeight.relaxed,
            color: colors.text.primary,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxHeight: '400px',
            overflowY: 'auto'
          }}
        >
          {state.response || (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.sm,
                color: colors.text.tertiary
              }}
            >
              <Loader2 size={16} className="animate-spin" />
              <span>L'agent réfléchit...</span>
            </div>
          )}

          {/* Typing cursor effect when streaming */}
          {state.isStreaming && state.response && (
            <span
              style={{
                display: 'inline-block',
                width: '2px',
                height: '1em',
                backgroundColor: colors.text.primary,
                marginLeft: '2px',
                animation: 'blink 1s infinite'
              }}
            />
          )}
        </div>
      )}

      {/* Tool Execution Status */}
      {state.toolsExecuted.length > 0 && <ToolExecutionStatus tools={state.toolsExecuted} />}

      {/* Error Display */}
      {state.error && (
        <div
          style={{
            padding: spacing.lg,
            backgroundColor: colors.state.error + '10',
            border: `1px solid ${colors.state.error}40`,
            borderRadius: '2px',
            fontSize: typography.fontSize.sm,
            color: colors.state.error
          }}
        >
          <div
            style={{
              fontWeight: typography.fontWeight.medium,
              marginBottom: spacing.xs
            }}
          >
            Erreur
          </div>
          <div>{state.error}</div>
        </div>
      )}

      {/* Completion Indicator */}
      {state.isComplete && !state.error && (
        <div
          style={{
            padding: spacing.md,
            textAlign: 'center',
            fontSize: typography.fontSize.xs,
            color: colors.text.tertiary
          }}
        >
          ✓ Terminé
        </div>
      )}

      {/* CSS for blinking cursor */}
      <style>
        {`
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
        `}
      </style>
    </div>
  )
}
