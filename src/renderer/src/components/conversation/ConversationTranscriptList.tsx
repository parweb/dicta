/**
 * Conversation Transcript List Component
 * Displays transcriptions in a conversation-style layout
 */

import { useEffect, useRef } from 'react'
import { useTheme } from '@/lib/theme-context'
import TranscriptionMessage from './TranscriptionMessage'
import type { Transcription } from '@/lib/history'

interface ConversationTranscriptListProps {
  transcriptions: Transcription[]
  onCopyTranscript?: (transcription: Transcription) => void
  onOpenActions?: (transcription: Transcription) => void
}

export default function ConversationTranscriptList({
  transcriptions,
  onCopyTranscript,
  onOpenActions
}: ConversationTranscriptListProps) {
  const { theme } = useTheme()
  const { spacing } = theme
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new transcriptions added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [transcriptions])

  return (
    <div
      ref={scrollRef}
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: spacing.lg,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {transcriptions.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.colors.text.tertiary,
            fontSize: theme.typography.fontSize.sm
          }}
        >
          Aucune transcription. Appuyez sur X pour commencer à enregistrer.
        </div>
      ) : (
        transcriptions.map((transcription) => (
          <TranscriptionMessage
            key={transcription.id}
            text={transcription.text}
            audioAmplitudes={transcription.audioAmplitudes}
            audioDuration={transcription.durationMs}
            timestamp={transcription.timestamp}
            onCopy={() => onCopyTranscript?.(transcription)}
            onOpenActions={() => onOpenActions?.(transcription)}
          />
        ))
      )}
    </div>
  )
}
