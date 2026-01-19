/**
 * Conversation Timeline Component
 * Custom scrollbar with timeline navigation points
 */

import { useEffect, useRef, useState } from 'react'
import { useTheme } from '@/lib/theme-context'

interface ConversationTimelineProps {
  itemCount: number
  currentIndex: number
  onNavigate?: (index: number) => void
  scrollProgress: number // 0-1 representing scroll position
  onScroll?: (progress: number) => void
}

export default function ConversationTimeline({
  itemCount,
  currentIndex,
  onNavigate,
  scrollProgress,
  onScroll
}: ConversationTimelineProps) {
  const { theme } = useTheme()
  const { colors, spacing } = theme
  const [isDragging, setIsDragging] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  if (itemCount === 0) return null

  // Handle drag to scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    handleDrag(e.clientY)
  }

  const handleDrag = (clientY: number) => {
    if (!trackRef.current) return

    const rect = trackRef.current.getBoundingClientRect()
    const y = clientY - rect.top
    const progress = Math.max(0, Math.min(1, y / rect.height))
    onScroll?.(progress)
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      handleDrag(e.clientY)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  // Calculate thumb height and position (20% of track minimum)
  const thumbHeight = Math.max(60, 200 * (1 / itemCount))
  const trackHeight = trackRef.current?.clientHeight || 500
  const thumbPosition = scrollProgress * (100 - (thumbHeight / trackHeight) * 100)

  return (
    <div
      ref={trackRef}
      style={{
        position: 'absolute',
        right: spacing.sm,
        top: spacing.lg,
        bottom: spacing.lg,
        width: '48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
        cursor: isDragging ? 'grabbing' : 'grab',
        pointerEvents: 'auto'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Track background */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          bottom: 0,
          width: '4px',
          backgroundColor: colors.background.tertiary,
          transform: 'translateX(-50%)',
          borderRadius: '2px'
        }}
      />

      {/* Scrollbar thumb */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: `${thumbPosition}%`,
          width: '8px',
          height: `${thumbHeight}px`,
          backgroundColor: colors.accent.blue.primary,
          transform: 'translateX(-50%)',
          borderRadius: '4px',
          transition: isDragging ? 'none' : 'top 0.1s ease',
          opacity: isDragging ? 0.8 : 0.6,
          pointerEvents: 'none',
          boxShadow: isDragging ? `0 0 8px ${colors.accent.blue.primary}` : 'none'
        }}
      />

      {/* Navigation points */}
      {Array.from({ length: itemCount }).map((_, index) => {
        const isCurrent = index === currentIndex
        const position = itemCount === 1 ? 50 : (index / (itemCount - 1)) * 100

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: `${position}%`,
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'auto',
              cursor: 'pointer',
              zIndex: 20
            }}
            onClick={(e) => {
              e.stopPropagation()
              onNavigate?.(index)
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Point */}
            <div
              style={{
                width: isCurrent ? '14px' : '10px',
                height: isCurrent ? '14px' : '10px',
                borderRadius: '50%',
                backgroundColor: isCurrent ? colors.background.primary : colors.text.primary,
                border: isCurrent ? `2px solid ${colors.state.error}` : `2px solid ${colors.border.primary}`,
                transition: 'all 0.2s ease',
                boxShadow: isCurrent ? '0 0 0 4px rgba(239, 68, 68, 0.2)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isCurrent) {
                  e.currentTarget.style.transform = 'scale(1.3)'
                  e.currentTarget.style.backgroundColor = colors.accent.blue.primary
                }
              }}
              onMouseLeave={(e) => {
                if (!isCurrent) {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.backgroundColor = colors.text.primary
                }
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
