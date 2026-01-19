/**
 * Bedrock Agent Drawer Component
 * Main UI for interacting with Bedrock agent on transcriptions
 */

import { useState } from 'react'
import { Sparkles, X } from 'lucide-react'

import { useBedrock } from '../../contexts/BedrockContext'
import { useBedrockAgent } from '../../hooks/useBedrockAgent'
import { useTheme } from '../../lib/theme-context'
import { Button } from '../ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '../ui/drawer'
import AgentStreamingDisplay from './AgentStreamingDisplay'

interface BedrockAgentDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transcriptContext?: string
}

export default function BedrockAgentDrawer({
  open,
  onOpenChange,
  transcriptContext
}: BedrockAgentDrawerProps) {
  const { theme } = useTheme()
  const { colors, spacing, typography } = theme
  const { hasCredentials } = useBedrock()
  const { state, executeAgent, reset } = useBedrockAgent()

  const [prompt, setPrompt] = useState('')

  // Handle drawer close
  const handleClose = () => {
    reset()
    setPrompt('')
    onOpenChange(false)
  }

  // Handle execute
  const handleExecute = async () => {
    if (!prompt.trim()) return
    await executeAgent(prompt, transcriptContext)
  }

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleExecute()
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
            <Sparkles size={20} color={colors.accent.blue} />
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
            padding: spacing.lg,
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.lg,
            height: '100%',
            overflow: 'auto'
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

          {/* Prompt Input (only show if not streaming and no response yet) */}
          {!state.isStreaming && !state.response && !state.error && (
            <>
              <div>
                <label
                  htmlFor="agent-prompt"
                  style={{
                    display: 'block',
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.text.secondary,
                    marginBottom: spacing.sm
                  }}
                >
                  Que voulez-vous faire avec cette transcription ?
                </label>
                <textarea
                  id="agent-prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ex: Ajoute un événement au calendrier pour demain à 14h, Sauvegarde cette transcription comme note, Envoie un email à Jean avec ce contenu..."
                  disabled={!hasCredentials}
                  style={{
                    width: '100%',
                    minHeight: '100px',
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
                  Cmd/Ctrl + Enter pour exécuter
                </div>
              </div>

              <Button
                onClick={handleExecute}
                disabled={!hasCredentials || !prompt.trim() || state.isStreaming}
                style={{
                  alignSelf: 'flex-start'
                }}
              >
                <Sparkles size={16} />
                Exécuter
              </Button>
            </>
          )}

          {/* Streaming Display */}
          {(state.isStreaming || state.response || state.error) && (
            <div style={{ flex: 1, minHeight: 0 }}>
              <AgentStreamingDisplay state={state} />
            </div>
          )}

          {/* Reset button after completion */}
          {state.isComplete && !state.isStreaming && (
            <Button
              variant="outline"
              onClick={() => {
                reset()
                setPrompt('')
              }}
              style={{
                alignSelf: 'flex-start'
              }}
            >
              Nouvelle action
            </Button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
