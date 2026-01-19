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
  const [scrollProgress, setScrollProgress] = useState(1)

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

  // Update current index and scroll progress based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollElement = parentRef.current
      if (!scrollElement) return

      // Calculate scroll progress
      const maxScroll = scrollElement.scrollHeight - scrollElement.clientHeight
      const progress = maxScroll > 0 ? scrollElement.scrollTop / maxScroll : 0
      setScrollProgress(progress)

      // Find the item closest to the middle of the viewport
      const items = virtualizer.getVirtualItems()
      if (items.length > 0) {
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

    const scrollElement = parentRef.current
    scrollElement?.addEventListener('scroll', handleScroll)

    // Initial calculation
    handleScroll()

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

  // Handle scroll from timeline drag
  const handleTimelineScroll = (progress: number) => {
    const scrollElement = parentRef.current
    if (!scrollElement) return

    const maxScroll = scrollElement.scrollHeight - scrollElement.clientHeight
    scrollElement.scrollTop = progress * maxScroll
  }

  return (
    <div
      style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Timeline - positioned on right */}
      {transcriptions.length > 0 && (
        <ConversationTimeline
          itemCount={transcriptions.length}
          currentIndex={currentIndex}
          scrollProgress={scrollProgress}
          onNavigate={handleNavigate}
          onScroll={handleTimelineScroll}
        />
      )}

      {/* Scrollable content */}
      <div
        ref={parentRef}
        style={{
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: spacing.lg,
          paddingRight: transcriptions.length > 0 ? '72px' : spacing.lg, // Extra padding for timeline
          WebkitAppRegion: 'no-drag',
          // Hide native scrollbar
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          // Enable smooth scrolling with GPU acceleration
          scrollBehavior: 'smooth',
          willChange: 'scroll-position'
        } as React.CSSProperties & { scrollbarWidth?: string; msOverflowStyle?: string }}
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
