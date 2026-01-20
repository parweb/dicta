/**
 * Timeline Transcript List Component
 * Displays transcriptions in a timeline layout with virtualization and scrollbar
 */

import { useEffect, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useTheme } from '@/lib/theme-context'
import TranscriptionMessage from './TranscriptionMessage'
import SimpleScrollbar from './SimpleScrollbar'
import type { Transcription } from '@/lib/history'

interface TimelineTranscriptListProps {
  transcriptions: Transcription[]
  onCopyTranscript?: (transcription: Transcription) => void
  onOpenActions?: (transcription: Transcription) => void
}

export default function TimelineTranscriptList({
  transcriptions,
  onCopyTranscript,
  onOpenActions
}: TimelineTranscriptListProps) {
  const { theme } = useTheme()
  const { spacing } = theme
  const parentRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(transcriptions.length - 1)
  const [scrollProgress, setScrollProgress] = useState(1)

  // Virtualize the list for performance - PROPERLY optimized for large datasets
  const virtualizer = useVirtualizer({
    count: transcriptions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 150, // Estimated height per item
    overscan: 5, // OPTIMAL: 5 items buffer for smooth scrolling
    measureElement: (el) => el?.getBoundingClientRect().height ?? 150
    // Use default observeElementRect - it's optimized and works correctly
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
    scrollElement?.addEventListener('scroll', handleScroll, { passive: true })

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
      {/* Simple Custom Scrollbar */}
      {transcriptions.length > 0 && (
        <SimpleScrollbar
          scrollProgress={scrollProgress}
          onScroll={handleTimelineScroll}
          itemCount={transcriptions.length}
          currentIndex={currentIndex}
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
                    transform: `translateY(${virtualItem.start}px)`,
                    willChange: 'transform'
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
