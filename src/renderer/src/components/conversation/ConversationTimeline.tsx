/**
 * Conversation Timeline Component
 * Custom scrollbar with timeline navigation points
 */

import { useEffect, useRef, useState, useMemo } from 'react'
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
  const [isHoveringThumb, setIsHoveringThumb] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef<{ y: number; scrollProgress: number } | null>(null)

  if (itemCount === 0) return null

  // Handle thumb drag
  const handleThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    dragStartRef.current = {
      y: e.clientY,
      scrollProgress: scrollProgress
    }
  }

  // Handle track click (jump to position)
  const handleTrackClick = (e: React.MouseEvent) => {
    if (!trackRef.current) return

    // Don't trigger if clicking on thumb
    if (thumbRef.current?.contains(e.target as Node)) return

    const rect = trackRef.current.getBoundingClientRect()
    const y = e.clientY - rect.top
    const progress = Math.max(0, Math.min(1, y / rect.height))
    onScroll?.(progress)
  }

  useEffect(() => {
    if (!isDragging || !dragStartRef.current) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!trackRef.current || !dragStartRef.current) return

      const rect = trackRef.current.getBoundingClientRect()
      const deltaY = e.clientY - dragStartRef.current.y
      const deltaProgress = deltaY / rect.height
      const newProgress = Math.max(0, Math.min(1, dragStartRef.current.scrollProgress + deltaProgress))

      onScroll?.(newProgress)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      dragStartRef.current = null
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, onScroll])

  // Calculate thumb height and position (20% of track minimum) - memoized for performance
  const thumbHeight = useMemo(() => Math.max(60, 200 * (1 / itemCount)), [itemCount])
  const trackHeight = trackRef.current?.clientHeight || 500
  const thumbPosition = useMemo(() => {
    return scrollProgress * (100 - (thumbHeight / trackHeight) * 100)
  }, [scrollProgress, thumbHeight, trackHeight])

  // Calculate activity bars (density visualization) - memoized
  const activityBars = useMemo(() => {
    const activitySegments = 20 // Number of segments to divide timeline into
    return Array.from({ length: activitySegments }).map((_, segmentIndex) => {
      const segmentStart = (segmentIndex / activitySegments) * itemCount
      const segmentEnd = ((segmentIndex + 1) / activitySegments) * itemCount

      // Count items in this segment
      let count = 0
      for (let i = Math.floor(segmentStart); i < Math.ceil(segmentEnd) && i < itemCount; i++) {
        count++
      }

      // Normalize to 0-1 range
      const maxItemsPerSegment = Math.ceil(itemCount / activitySegments) * 1.5
      const intensity = Math.min(1, count / maxItemsPerSegment)

      return {
        position: ((segmentIndex + 0.5) / activitySegments) * 100, // Center of segment
        intensity
      }
    })
  }, [itemCount])

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
        cursor: 'pointer',
        pointerEvents: 'auto'
      }}
      onClick={handleTrackClick}
    >
      {/* Activity bars - shown during drag */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          bottom: 0,
          width: '40px',
          transform: `translateX(-100%) scale(${isDragging ? 1 : 0.8})`,
          opacity: isDragging ? 1 : 0,
          transition: 'opacity 0.3s cubic-bezier(0.4, 0.0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
          pointerEvents: 'none',
          willChange: 'opacity, transform'
        }}
      >
        {activityBars.map((bar, index) => (
          <div
            key={`activity-${index}`}
            style={{
              position: 'absolute',
              right: '8px',
              top: `${bar.position}%`,
              transform: `translateY(-50%) scaleX(${isDragging ? 1 : 0})`,
              transformOrigin: 'right center',
              width: `${8 + bar.intensity * 24}px`, // 8px to 32px based on intensity
              height: '2px',
              backgroundColor: colors.accent.blue.primary,
              opacity: 0.3 + bar.intensity * 0.5, // 0.3 to 0.8 opacity
              borderRadius: '1px',
              transition: `transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1) ${index * 0.01}s`,
              willChange: 'transform'
            }}
          />
        ))}
      </div>

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
        ref={thumbRef}
        style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          width: isHoveringThumb || isDragging ? '12px' : '8px',
          height: `${thumbHeight}px`,
          backgroundColor: colors.accent.blue.primary,
          transform: `translate(-50%, ${thumbPosition}%)`,
          borderRadius: '6px',
          transition: isDragging
            ? 'width 0.15s cubic-bezier(0.4, 0.0, 0.2, 1), opacity 0.15s cubic-bezier(0.4, 0.0, 0.2, 1), box-shadow 0.15s cubic-bezier(0.4, 0.0, 0.2, 1)'
            : 'all 0.25s cubic-bezier(0.4, 0.0, 0.2, 1)',
          opacity: isDragging ? 1 : isHoveringThumb ? 0.9 : 0.6,
          pointerEvents: 'auto',
          cursor: isDragging ? 'grabbing' : 'grab',
          boxShadow: isDragging
            ? `0 0 20px ${colors.accent.blue.primary}, 0 0 40px ${colors.accent.blue.primary}40`
            : isHoveringThumb
            ? `0 0 12px ${colors.accent.blue.primary}`
            : 'none',
          zIndex: 15,
          willChange: 'transform, width, opacity, box-shadow'
        }}
        onMouseDown={handleThumbMouseDown}
        onMouseEnter={() => setIsHoveringThumb(true)}
        onMouseLeave={() => setIsHoveringThumb(false)}
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
                transition: 'all 0.25s cubic-bezier(0.4, 0.0, 0.2, 1)',
                boxShadow: isCurrent
                  ? `0 0 0 4px rgba(239, 68, 68, 0.2), 0 0 8px rgba(239, 68, 68, 0.3)`
                  : 'none',
                willChange: 'transform, background-color, box-shadow',
                transform: 'scale(1)'
              }}
              onMouseEnter={(e) => {
                if (!isCurrent) {
                  e.currentTarget.style.transform = 'scale(1.4)'
                  e.currentTarget.style.backgroundColor = colors.accent.blue.primary
                  e.currentTarget.style.boxShadow = `0 0 8px ${colors.accent.blue.primary}60`
                }
              }}
              onMouseLeave={(e) => {
                if (!isCurrent) {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.backgroundColor = colors.text.primary
                  e.currentTarget.style.boxShadow = 'none'
                }
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
