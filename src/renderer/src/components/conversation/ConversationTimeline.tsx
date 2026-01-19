/**
 * Conversation Timeline Component
 * Custom scrollbar with timeline navigation points
 */

import { useEffect, useRef, useState, useMemo } from 'react'
import { useTheme } from '@/lib/theme-context'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ConversationTimelineProps {
  timestamps: number[] // Unix timestamps in milliseconds for each item
  texts?: string[] // Text content for tooltip preview (optional)
  currentIndex: number
  onNavigate?: (index: number) => void
  scrollProgress: number // 0-1 representing scroll position
  onScroll?: (progress: number) => void
}

export default function ConversationTimeline({
  timestamps,
  texts,
  currentIndex,
  onNavigate,
  scrollProgress,
  onScroll
}: ConversationTimelineProps) {
  const { theme } = useTheme()
  const { colors, spacing } = theme
  const [isDragging, setIsDragging] = useState(false)
  const [isHoveringThumb, setIsHoveringThumb] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
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

    // First pass: calculate all positions and gaps
    const allPoints = timestamps.map((timestamp, index) => {
      const position =
        itemCount === 1 || timeRange === 0
          ? 50
          : ((timestamp - minTimestamp) / timeRange) * 100

      // Calculate gap from previous item
      const gap = index > 0 ? timestamp - timestamps[index - 1] : 0

      // Check for week boundary (more significant than day)
      const isWeekBoundary =
        index > 0 &&
        new Date(timestamp).toLocaleDateString('fr-FR', { weekday: 'long' }) === 'lundi' &&
        new Date(timestamps[index - 1]).toLocaleDateString('fr-FR', { weekday: 'long' }) !== 'lundi'

      return {
        index,
        position,
        timestamp,
        gap,
        isWeekBoundary
      }
    })

    // Identify remarkable points intelligently
    const remarkableIndices = new Set<number>()

    // Always include first and last
    remarkableIndices.add(0)
    remarkableIndices.add(itemCount - 1)

    // Find significant gaps (top 20 largest gaps)
    const pointsWithGaps = allPoints
      .filter((p) => p.gap > 0)
      .sort((a, b) => b.gap - a.gap)

    const maxRemarkablePoints = Math.min(20, Math.floor(itemCount / 20)) // Max 20 or 5% of total
    const topGaps = pointsWithGaps.slice(0, maxRemarkablePoints)

    // Add points with significant gaps (> 12 hours) or week boundaries
    topGaps.forEach((point) => {
      if (point.gap > 12 * 60 * 60 * 1000 || point.isWeekBoundary) {
        remarkableIndices.add(point.index)
      }
    })

    // If we have very few remarkable points, add some week boundaries
    if (remarkableIndices.size < 10) {
      allPoints.forEach((point) => {
        if (point.isWeekBoundary && remarkableIndices.size < 15) {
          remarkableIndices.add(point.index)
        }
      })
    }

    // Return final points with remarkable flag
    return allPoints.map((point) => ({
      position: point.position,
      timestamp: point.timestamp,
      isRemarkable: remarkableIndices.has(point.index)
    }))
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
        zIndex: 50,
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
          willChange: 'opacity, transform',
          zIndex: 1
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
          boxShadow: `0 0 10px ${colors.accent.blue.primary}15, inset 0 0 10px ${colors.background.primary}40`,
          zIndex: 5
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
          zIndex: 10,
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
        const isHovered = hoveredIndex === index

        // Format date for label and tooltip
        const dateLabel = format(point.timestamp, 'd MMM', { locale: fr })
        const dateTime = format(point.timestamp, 'dd/MM/yyyy HH:mm', { locale: fr })
        const textPreview = texts && texts[index] ? texts[index].slice(0, 60) + (texts[index].length > 60 ? '...' : '') : ''

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
              zIndex: isCurrent ? 20 : 15,
              padding: '8px' // Enlarged hover area
            }}
            onClick={(e) => {
              e.stopPropagation()
              onNavigate?.(index)
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Tooltip */}
            {isHovered && !isDragging && (
              <div
                style={{
                  position: 'absolute',
                  right: '24px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: colors.background.secondary,
                  border: `1px solid ${colors.border.primary}`,
                  borderRadius: '8px',
                  padding: '8px 12px',
                  boxShadow: `0 4px 12px ${colors.background.primary}80`,
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                  zIndex: 100,
                  minWidth: '200px',
                  maxWidth: '300px'
                }}
              >
                <div
                  style={{
                    fontSize: theme.typography.fontSize.xs,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: colors.text.primary,
                    marginBottom: '4px'
                  }}
                >
                  {dateTime}
                </div>
                {textPreview && (
                  <div
                    style={{
                      fontSize: theme.typography.fontSize.xs,
                      color: colors.text.secondary,
                      whiteSpace: 'normal',
                      wordBreak: 'break-word'
                    }}
                  >
                    {textPreview}
                  </div>
                )}
              </div>
            )}

            {/* Temporal label for remarkable points */}
            {isRemarkable && !isCurrent && !isDragging && (
              <div
                style={{
                  position: 'absolute',
                  right: '24px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: theme.typography.fontSize.xs,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: colors.accent.blue.primary,
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                  opacity: isHovered ? 0 : 0.7,
                  transition: 'opacity 0.2s'
                }}
              >
                {dateLabel}
              </div>
            )}

            {/* Point with modern design */}
            <div
              style={{
                position: 'relative',
                width: isCurrent ? '18px' : isRemarkable ? '14px' : '10px',
                height: isCurrent ? '18px' : isRemarkable ? '14px' : '10px',
                borderRadius: '50%',
                background: isCurrent
                  ? `radial-gradient(circle, #fbbf24 0%, #f59e0b 40%, #ef4444 100%)`
                  : isRemarkable
                  ? `radial-gradient(circle, ${colors.accent.blue.light} 0%, ${colors.accent.blue.primary} 100%)`
                  : `radial-gradient(circle, ${colors.text.primary} 0%, ${colors.text.tertiary} 100%)`,
                border: isCurrent
                  ? `2.5px solid #fbbf24`
                  : isRemarkable
                  ? `2px solid ${colors.accent.blue.light}`
                  : `1.5px solid ${colors.border.primary}`,
                transition: 'all 0.25s cubic-bezier(0.4, 0.0, 0.2, 1)',
                boxShadow: isCurrent
                  ? `0 0 0 4px rgba(251, 191, 36, 0.3),
                     0 0 0 8px rgba(251, 191, 36, 0.15),
                     0 0 24px rgba(251, 191, 36, 0.8),
                     0 0 40px rgba(239, 68, 68, 0.6),
                     inset 0 2px 4px rgba(255, 255, 255, 0.5),
                     inset 0 -2px 4px rgba(239, 68, 68, 0.3)`
                  : isRemarkable
                  ? `0 0 0 4px ${colors.accent.blue.primary}20,
                     0 0 12px ${colors.accent.blue.primary}60,
                     inset 0 1px 2px rgba(255, 255, 255, 0.2)`
                  : `0 0 4px ${colors.background.primary}60`,
                willChange: 'transform, background, box-shadow',
                transform: isHovered && !isCurrent ? 'scale(1.5)' : 'scale(1)'
              }}
            >
              {/* Pulsing ring for current item */}
              {isCurrent && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '32px',
                    height: '32px',
                    transform: 'translate(-50%, -50%)',
                    borderRadius: '50%',
                    border: `2.5px solid #fbbf24`,
                    opacity: 0,
                    animation: 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    pointerEvents: 'none',
                    boxShadow: '0 0 20px rgba(251, 191, 36, 0.6)'
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
