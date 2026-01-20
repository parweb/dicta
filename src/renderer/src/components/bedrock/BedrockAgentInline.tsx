/**
 * Bedrock Agent Inline Component
 * Inline UI for interacting with Bedrock agent within the timeline
 */

import { useEffect, useState, useRef } from 'react'
import { Mic, Sparkles, X, ChevronDown, ChevronUp } from 'lucide-react'

import { useBedrock } from '../../contexts/BedrockContext'
import { useBedrockAgent } from '../../hooks/useBedrockAgent'
import { useThemeStore } from '@/hooks/useThemeStore'
import { Button } from '../ui/button'
import AgentStreamingDisplay from './AgentStreamingDisplay'
import ConversationView from './ConversationView'
import './BedrockAgentInline.css'

interface BedrockAgentInlineProps {
  transcriptContext: string
  onClose: () => void
  newTranscript?: string
  onTranscriptConsumed?: () => void
}

export default function BedrockAgentInline({
  transcriptContext,
  onClose,
  newTranscript,
  onTranscriptConsumed
}: BedrockAgentInlineProps) {
  const { theme } = useThemeStore()
  const { hasCredentials } = useBedrock()
  const { state, conversationMessages, executeAgent, continueConversation, reset } = useBedrockAgent()

  const [followUpPrompt, setFollowUpPrompt] = useState('')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const followUpInputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-execute when component mounts with transcript
  useEffect(() => {
    if (transcriptContext && hasCredentials && !state.isStreaming && !state.response && !state.error) {
      executeAgent(transcriptContext)
    }
  }, []) // Only on mount

  // Handle new transcript from recording (follow-up)
  useEffect(() => {
    if (newTranscript && state.isComplete && !state.isStreaming) {
      setFollowUpPrompt(newTranscript)
      followUpInputRef.current?.focus()
      onTranscriptConsumed?.()
    }
  }, [newTranscript, state.isComplete, state.isStreaming, onTranscriptConsumed])

  // Handle close
  const handleClose = () => {
    reset()
    setFollowUpPrompt('')
    onClose()
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
    <div className="bedrock-agent-inline">
      {/* Header */}
      <div className="agent-header">
        <div className="agent-title">
          <Sparkles size={16} className="agent-icon" />
          <span>Actions IA</span>
        </div>
        <div className="agent-controls">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="control-button"
            title={isCollapsed ? 'Développer' : 'Réduire'}
          >
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          <button
            onClick={handleClose}
            className="control-button"
            title="Fermer"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="agent-content">
          {/* Credentials warning */}
          {!hasCredentials && (
            <div className="agent-warning">
              Configurez vos credentials Bedrock dans Paramètres → Bedrock pour utiliser l'agent.
            </div>
          )}

          {/* Response Display */}
          {(state.isStreaming || state.response || state.error) && (
            <div className="agent-response">
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

          {/* Follow-up section */}
          {state.isComplete && !state.isStreaming && (
            <div className="agent-followup">
              <label htmlFor="follow-up" className="followup-label">
                <Mic size={12} />
                <span>Follow-up (Cmd+Shift+X pour dicter)</span>
              </label>
              <textarea
                id="follow-up"
                ref={followUpInputRef}
                value={followUpPrompt}
                onChange={(e) => setFollowUpPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Continuer la conversation..."
                disabled={!hasCredentials}
                className="followup-input"
              />
              <div className="followup-hint">
                Cmd/Ctrl + Enter pour envoyer
              </div>

              <div className="followup-actions">
                <Button
                  onClick={handleFollowUp}
                  disabled={!hasCredentials || !followUpPrompt.trim()}
                  className="followup-submit"
                >
                  <Sparkles size={14} />
                  Envoyer
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="followup-close"
                >
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
