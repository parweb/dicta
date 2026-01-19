/**
 * Conversation Transcript List Component
 * Displays transcriptions in a conversation-style layout with virtualization
 */

import { useEffect, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
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
  const parentRef = useRef<HTMLDivElement>(null)

  // Virtualize the list for performance
  const virtualizer = useVirtualizer({
    count: transcriptions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 150, // Estimated height per item
    overscan: 5, // Render 5 extra items above/below viewport
    measureElement: (el) => el?.getBoundingClientRect().height ?? 150
  })

  // Auto-scroll to bottom when new transcriptions added
  useEffect(() => {
    if (transcriptions.length > 0) {
      virtualizer.scrollToIndex(transcriptions.length - 1, {
        align: 'end',
        behavior: 'smooth'
      })
    }
  }, [transcriptions.length, virtualizer])

  return (
    <div
      ref={parentRef}
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: spacing.lg
      }}
    >
      {transcriptions.length === 0 ? (
        <div
          style={{
            height: '100%',
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
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative'
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const transcription = transcriptions[virtualItem.index]
            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`
                }}
              >
                <TranscriptionMessage
                  text={transcription.text}
                  audioAmplitudes={transcription.audioAmplitudes}
                  audioDuration={transcription.durationMs}
                  timestamp={transcription.timestamp}
                  onCopy={() => onCopyTranscript?.(transcription)}
                  onOpenActions={() => onOpenActions?.(transcription)}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
