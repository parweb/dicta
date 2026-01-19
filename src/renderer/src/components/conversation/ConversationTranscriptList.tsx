/**
 * Conversation Transcript List Component
 * Displays transcriptions in a conversation-style layout with virtualization and timeline
 */

import { useEffect, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useTheme } from '@/lib/theme-context'
import TranscriptionMessage from './TranscriptionMessage'
import ConversationTimeline from './ConversationTimeline'
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
  const [currentIndex, setCurrentIndex] = useState(transcriptions.length - 1)

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
      setCurrentIndex(transcriptions.length - 1)
      virtualizer.scrollToIndex(transcriptions.length - 1, {
        align: 'end',
        behavior: 'smooth'
      })
    }
  }, [transcriptions.length, virtualizer])

  // Update current index based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const items = virtualizer.getVirtualItems()
      if (items.length > 0) {
        // Find the item closest to the middle of the viewport
        const scrollElement = parentRef.current
        if (scrollElement) {
          const viewportMiddle = scrollElement.scrollTop + scrollElement.clientHeight / 2
          let closestIndex = 0
          let closestDistance = Infinity

          items.forEach((item) => {
            const itemMiddle = item.start + item.size / 2
            const distance = Math.abs(itemMiddle - viewportMiddle)
            if (distance < closestDistance) {
              closestDistance = distance
              closestIndex = item.index
            }
          })

          setCurrentIndex(closestIndex)
        }
      }
    }

    const scrollElement = parentRef.current
    scrollElement?.addEventListener('scroll', handleScroll)
    return () => scrollElement?.removeEventListener('scroll', handleScroll)
  }, [virtualizer])

  // Navigate to specific index
  const handleNavigate = (index: number) => {
    setCurrentIndex(index)
    virtualizer.scrollToIndex(index, {
      align: 'center',
      behavior: 'smooth'
    })
  }

  return (
    <div
      style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Timeline */}
      {transcriptions.length > 0 && (
        <ConversationTimeline
          itemCount={transcriptions.length}
          currentIndex={currentIndex}
          onNavigate={handleNavigate}
        />
      )}

      {/* Scrollable content */}
      <div
        ref={parentRef}
        style={{
          height: '100%',
          overflowY: 'auto',
          padding: spacing.lg,
          paddingLeft: transcriptions.length > 0 ? '80px' : spacing.lg, // Extra padding for timeline
          WebkitAppRegion: 'no-drag'
        } as React.CSSProperties}
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
    </div>
  )
}
