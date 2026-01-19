/**
 * Conversation Timeline Component
 * Custom scrollbar with timeline navigation points
 */

import { useEffect, useRef, useState, useMemo } from 'react'
import { useTheme } from '@/lib/theme-context'

interface ConversationTimelineProps {
  timestamps: number[] // Unix timestamps in milliseconds for each item
  currentIndex: number
  onNavigate?: (index: number) => void
  scrollProgress: number // 0-1 representing scroll position
  onScroll?: (progress: number) => void
}

export default function ConversationTimeline({
  timestamps,
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

  const itemCount = timestamps.length
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

  // Calculate temporal positions and remarkable points - memoized
  const timelinePoints = useMemo(() => {
    if (itemCount === 0) return []

    const minTimestamp = timestamps[0]
    const maxTimestamp = timestamps[timestamps.length - 1]
    const timeRange = maxTimestamp - minTimestamp

    return timestamps.map((timestamp, index) => {
      // Calculate position based on real time (0-100%)
      const position =
        itemCount === 1 || timeRange === 0
          ? 50
          : ((timestamp - minTimestamp) / timeRange) * 100

      // Identify remarkable points
      const isFirst = index === 0
      const isLast = index === timestamps.length - 1

      // Check for day boundary (new day from previous item)
      const isDayBoundary =
        index > 0 &&
        new Date(timestamp).toDateString() !== new Date(timestamps[index - 1]).toDateString()

      // Check for significant gap (> 1 hour from previous item)
      const isSignificantGap =
        index > 0 && timestamp - timestamps[index - 1] > 60 * 60 * 1000

      const isRemarkable = isFirst || isLast || isDayBoundary || isSignificantGap

      return {
        position,
        isRemarkable,
        timestamp
      }
    })
  }, [timestamps, itemCount])

  // Calculate activity bars (density visualization) - memoized
  const activityBars = useMemo(() => {
    if (itemCount === 0) return []

    const minTimestamp = timestamps[0]
    const maxTimestamp = timestamps[timestamps.length - 1]
    const timeRange = maxTimestamp - minTimestamp

    if (timeRange === 0) return []

    const activitySegments = 20 // Number of segments to divide timeline into
    const segmentDuration = timeRange / activitySegments

    return Array.from({ length: activitySegments }).map((_, segmentIndex) => {
      const segmentStartTime = minTimestamp + segmentIndex * segmentDuration
      const segmentEndTime = segmentStartTime + segmentDuration

      // Count items in this time segment
      let count = 0
      for (let i = 0; i < itemCount; i++) {
        if (timestamps[i] >= segmentStartTime && timestamps[i] < segmentEndTime) {
          count++
        }
      }

      // Normalize to 0-1 range
      const maxItemsPerSegment = Math.ceil(itemCount / activitySegments) * 1.5
      const intensity = Math.min(1, count / maxItemsPerSegment)

      // Position is temporal, not linear
      const segmentMiddleTime = segmentStartTime + segmentDuration / 2
      const position = ((segmentMiddleTime - minTimestamp) / timeRange) * 100

      return {
        position,
        intensity
      }
    })
  }, [timestamps, itemCount])

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
              width: `${12 + bar.intensity * 28}px`, // 12px to 40px based on intensity
              height: '3px',
              background: `linear-gradient(90deg,
                ${colors.accent.blue.primary}00 0%,
                ${colors.accent.blue.primary}${Math.round((0.5 + bar.intensity * 0.5) * 255).toString(16).padStart(2, '0')} 50%,
                ${colors.accent.blue.light}${Math.round((0.7 + bar.intensity * 0.3) * 255).toString(16).padStart(2, '0')} 100%)`,
              borderRadius: '2px',
              transition: `transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1) ${index * 0.015}s`,
              boxShadow: `0 0 ${4 + bar.intensity * 8}px ${colors.accent.blue.primary}${Math.round(bar.intensity * 128).toString(16).padStart(2, '0')}`,
              willChange: 'transform'
            }}
          />
        ))}
      </div>

      {/* Track background with gradient */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          bottom: 0,
          width: '3px',
          background: `linear-gradient(180deg,
            ${colors.accent.blue.primary}20 0%,
            ${colors.accent.blue.primary}40 50%,
            ${colors.accent.blue.primary}20 100%)`,
          transform: 'translateX(-50%)',
          borderRadius: '2px',
          boxShadow: `0 0 10px ${colors.accent.blue.primary}15, inset 0 0 10px ${colors.background.primary}40`
        }}
      />

      {/* Scrollbar thumb - ultra modern design */}
      <div
        ref={thumbRef}
        style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          width: isHoveringThumb || isDragging ? '16px' : '10px',
          height: `${thumbHeight}px`,
          background: isDragging
            ? `linear-gradient(135deg,
                ${colors.accent.blue.primary} 0%,
                ${colors.accent.blue.light} 50%,
                ${colors.accent.blue.primary} 100%)`
            : `linear-gradient(135deg,
                ${colors.accent.blue.primary}E0 0%,
                ${colors.accent.blue.light}C0 100%)`,
          transform: `translate(-50%, ${thumbPosition}%)`,
          borderRadius: '8px',
          transition: isDragging
            ? 'width 0.15s cubic-bezier(0.4, 0.0, 0.2, 1), box-shadow 0.15s cubic-bezier(0.4, 0.0, 0.2, 1)'
            : 'all 0.25s cubic-bezier(0.4, 0.0, 0.2, 1)',
          pointerEvents: 'auto',
          cursor: isDragging ? 'grabbing' : 'grab',
          boxShadow: isDragging
            ? `0 0 30px ${colors.accent.blue.primary}E0,
               0 0 60px ${colors.accent.blue.primary}80,
               0 0 90px ${colors.accent.blue.primary}40,
               inset 0 2px 8px rgba(255, 255, 255, 0.3),
               inset 0 -2px 8px rgba(0, 0, 0, 0.3)`
            : isHoveringThumb
            ? `0 0 20px ${colors.accent.blue.primary}C0,
               0 0 40px ${colors.accent.blue.primary}60,
               inset 0 1px 4px rgba(255, 255, 255, 0.2)`
            : `0 0 8px ${colors.accent.blue.primary}60,
               inset 0 1px 2px rgba(255, 255, 255, 0.15)`,
          border: `1px solid ${colors.accent.blue.light}40`,
          backdropFilter: 'blur(8px)',
          zIndex: 15,
          willChange: 'transform, width, box-shadow'
        }}
        onMouseDown={handleThumbMouseDown}
        onMouseEnter={() => setIsHoveringThumb(true)}
        onMouseLeave={() => setIsHoveringThumb(false)}
      />

      {/* Navigation points */}
      {timelinePoints.map((point, index) => {
        const isCurrent = index === currentIndex
        const isRemarkable = point.isRemarkable

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: `${point.position}%`,
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
            {/* Point with modern design */}
            <div
              style={{
                position: 'relative',
                width: isCurrent ? '16px' : isRemarkable ? '14px' : '10px',
                height: isCurrent ? '16px' : isRemarkable ? '14px' : '10px',
                borderRadius: '50%',
                background: isCurrent
                  ? `radial-gradient(circle, ${colors.background.primary} 0%, ${colors.background.primary} 40%, ${colors.state.error} 100%)`
                  : isRemarkable
                  ? `radial-gradient(circle, ${colors.accent.blue.light} 0%, ${colors.accent.blue.primary} 100%)`
                  : `radial-gradient(circle, ${colors.text.primary} 0%, ${colors.text.tertiary} 100%)`,
                border: isCurrent
                  ? `2px solid ${colors.state.error}`
                  : isRemarkable
                  ? `2px solid ${colors.accent.blue.light}`
                  : `1.5px solid ${colors.border.primary}`,
                transition: 'all 0.25s cubic-bezier(0.4, 0.0, 0.2, 1)',
                boxShadow: isCurrent
                  ? `0 0 0 4px rgba(239, 68, 68, 0.15),
                     0 0 0 8px rgba(239, 68, 68, 0.08),
                     0 0 16px rgba(239, 68, 68, 0.4),
                     inset 0 1px 2px rgba(255, 255, 255, 0.3)`
                  : isRemarkable
                  ? `0 0 0 4px ${colors.accent.blue.primary}20,
                     0 0 12px ${colors.accent.blue.primary}60,
                     inset 0 1px 2px rgba(255, 255, 255, 0.2)`
                  : `0 0 4px ${colors.background.primary}60`,
                willChange: 'transform, background, box-shadow',
                transform: 'scale(1)'
              }}
              onMouseEnter={(e) => {
                if (!isCurrent) {
                  e.currentTarget.style.transform = 'scale(1.5)'
                  e.currentTarget.style.background = `radial-gradient(circle,
                    ${colors.accent.blue.light} 0%,
                    ${colors.accent.blue.primary} 100%)`
                  e.currentTarget.style.boxShadow = `0 0 0 4px ${colors.accent.blue.primary}20,
                    0 0 16px ${colors.accent.blue.primary}80,
                    inset 0 1px 3px rgba(255, 255, 255, 0.4)`
                  e.currentTarget.style.border = `2px solid ${colors.accent.blue.light}`
                }
              }}
              onMouseLeave={(e) => {
                if (!isCurrent) {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.background = `radial-gradient(circle, ${colors.text.primary} 0%, ${colors.text.tertiary} 100%)`
                  e.currentTarget.style.boxShadow = `0 0 4px ${colors.background.primary}60`
                  e.currentTarget.style.border = `1.5px solid ${colors.border.primary}`
                }
              }}
            >
              {/* Pulsing ring for current item */}
              {isCurrent && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '28px',
                    height: '28px',
                    transform: 'translate(-50%, -50%)',
                    borderRadius: '50%',
                    border: `2px solid ${colors.state.error}`,
                    opacity: 0,
                    animation: 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    pointerEvents: 'none'
                  }}
                />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
