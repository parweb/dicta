/**
 * Bedrock Agent Drawer Component
 * Main UI for interacting with Bedrock agent on transcriptions
 */

import { useEffect, useState, useRef } from 'react'
import { Mic, Sparkles, X } from 'lucide-react'

import { useBedrock } from '../../contexts/BedrockContext'
import { useBedrockAgent } from '../../hooks/useBedrockAgent'
import { useThemeStore } from '@/hooks/useThemeStore'
import { Button } from '../ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '../ui/drawer'
import AgentStreamingDisplay from './AgentStreamingDisplay'
import ConversationView from './ConversationView'

interface BedrockAgentDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transcriptContext?: string
  newTranscript?: string
  onTranscriptConsumed?: () => void
}

export default function BedrockAgentDrawer({
  open,
  onOpenChange,
  transcriptContext,
  newTranscript,
  onTranscriptConsumed
}: BedrockAgentDrawerProps) {
  const { theme } = useThemeStore()
  const { colors, spacing, typography } = theme
  const { hasCredentials } = useBedrock()
  const { state, conversationMessages, executeAgent, continueConversation, reset } = useBedrockAgent()

  const [followUpPrompt, setFollowUpPrompt] = useState('')
  const followUpInputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-execute when drawer opens with a transcript
  useEffect(() => {
    if (open && transcriptContext && hasCredentials && !state.isStreaming && !state.response && !state.error) {
      executeAgent(transcriptContext)
    }
  }, [open, transcriptContext, hasCredentials, state.isStreaming, state.response, state.error, executeAgent])

  // Handle new transcript from recording (follow-up)
  useEffect(() => {
    if (newTranscript && state.isComplete && !state.isStreaming) {
      setFollowUpPrompt(newTranscript)
      followUpInputRef.current?.focus()
      // Notify parent that transcript was consumed
      onTranscriptConsumed?.()
    }
  }, [newTranscript, state.isComplete, state.isStreaming, onTranscriptConsumed])

  // Handle drawer close
  const handleClose = () => {
    reset()
    setFollowUpPrompt('')
    onOpenChange(false)
  }

  // Handle follow-up submit
  const handleFollowUp = async () => {
    if (!followUpPrompt.trim()) return
    await continueConversation(followUpPrompt)
    setFollowUpPrompt('')
  }

  // Handle key press in follow-up input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleFollowUp()
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        style={
          {
            backgroundColor: colors.background.primary,
            border: `1px solid ${colors.border.primary}`,
            maxHeight: '80vh',
            WebkitAppRegion: 'no-drag'
          } as React.CSSProperties
        }
      >
        {/* Header */}
        <DrawerHeader
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: spacing.lg,
            borderBottom: `1px solid ${colors.border.primary}`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
            <Sparkles size={20} color={colors.accent.blue.primary} />
            <DrawerTitle
              style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.primary,
                margin: 0
              }}
            >
              Actions sur la transcription
            </DrawerTitle>
          </div>
          <button
            onClick={handleClose}
            style={{
              padding: spacing.xs,
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '2px',
              transition: 'background-color 0.15s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.background.secondary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <X size={20} color={colors.text.tertiary} />
          </button>
        </DrawerHeader>

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden'
          }}
        >
          {/* Scrollable area for response and tools */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: spacing.lg,
              display: 'flex',
              flexDirection: 'column',
              gap: spacing.lg
            }}
          >
            {/* Credentials warning */}
            {!hasCredentials && (
              <div
                style={{
                  padding: spacing.lg,
                  backgroundColor: colors.accent.yellow + '10',
                  border: `1px solid ${colors.accent.yellow}40`,
                  borderRadius: '2px',
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary
                }}
              >
                Configurez vos credentials Bedrock dans Paramètres → Bedrock pour utiliser l'agent.
              </div>
            )}

            {/* Display */}
            {(state.isStreaming || state.response || state.error) && (
              <div style={{ minHeight: 0 }}>
                {state.isConversationMode ? (
                  <ConversationView
                    messages={conversationMessages}
                    toolsExecuted={state.toolsExecuted}
                    isStreaming={state.isStreaming}
                  />
                ) : (
                  <AgentStreamingDisplay state={state} />
                )}
              </div>
            )}
          </div>

          {/* Fixed follow-up section at bottom */}
          {state.isComplete && !state.isStreaming && (
            <div
              style={{
                borderTop: `1px solid ${colors.border.primary}`,
                padding: spacing.lg,
                backgroundColor: colors.background.primary,
                display: 'flex',
                flexDirection: 'column',
                gap: spacing.md
              }}
            >
              <div>
                <label
                  htmlFor="follow-up"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.xs,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.text.secondary,
                    marginBottom: spacing.sm
                  }}
                >
                  <Mic size={14} />
                  <span>Follow-up (utilisez Cmd+Shift+X pour dicter)</span>
                </label>
                <textarea
                  id="follow-up"
                  ref={followUpInputRef}
                  value={followUpPrompt}
                  onChange={(e) => setFollowUpPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Continuer la conversation..."
                  disabled={!hasCredentials}
                  style={{
                    width: '100%',
                    minHeight: '60px',
                    maxHeight: '120px',
                    padding: spacing.md,
                    backgroundColor: colors.background.secondary + '40',
                    border: `1px solid ${colors.border.primary}`,
                    borderRadius: '2px',
                    color: colors.text.primary,
                    fontSize: typography.fontSize.sm,
                    lineHeight: typography.lineHeight.relaxed,
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.15s'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.text.tertiary
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border.primary
                  }}
                />
                <div
                  style={{
                    marginTop: spacing.xs,
                    fontSize: typography.fontSize.xs,
                    color: colors.text.tertiary
                  }}
                >
                  Cmd/Ctrl + Enter pour envoyer
                </div>
              </div>

              <div style={{ display: 'flex', gap: spacing.sm }}>
                <Button
                  onClick={handleFollowUp}
                  disabled={!hasCredentials || !followUpPrompt.trim()}
                  style={{
                    flex: 1
                  }}
                >
                  <Sparkles size={16} />
                  Envoyer
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                >
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
