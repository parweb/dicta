/**
 * Simple Custom Scrollbar
 * Clean, minimal, always works - composed of small components
 */

import { useState } from 'react'
import { useThemeStore } from '@/hooks/useThemeStore'
import { useScrollbarDrag } from '@/hooks/useScrollbarDrag'
import ScrollbarTrack from './ScrollbarTrack'
import ScrollbarThumb from './ScrollbarThumb'
import ScrollbarIndicator from './ScrollbarIndicator'

interface SimpleScrollbarProps {
  scrollProgress: number
  onScroll: (progress: number) => void
  itemCount: number
  currentIndex: number
}

export default function SimpleScrollbar({
  scrollProgress,
  onScroll,
  itemCount,
  currentIndex
}: SimpleScrollbarProps) {
  const { theme } = useThemeStore()
  const { spacing } = theme
  const [isHovering, setIsHovering] = useState(false)

  const thumbHeight = 80
  const { isDragging, trackRef, handleMouseDown } = useScrollbarDrag({
    scrollProgress,
    thumbHeight,
    onScroll
  })

  const trackHeight = trackRef.current?.clientHeight || 500
  const thumbPosition = scrollProgress * (trackHeight - thumbHeight)
  const indicatorPosition = (currentIndex / Math.max(1, itemCount - 1)) * trackHeight

  const handleTrackClick = (e: React.MouseEvent) => {
    if (!trackRef.current) return
    if (e.target !== trackRef.current) return

    const rect = trackRef.current.getBoundingClientRect()
    const clickY = e.clientY - rect.top
    const newProgress = Math.max(0, Math.min(1, (clickY - thumbHeight / 2) / (rect.height - thumbHeight)))

    onScroll(newProgress)
  }

  return (
    <div
      ref={trackRef}
      onClick={handleTrackClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        position: 'absolute',
        right: spacing.sm,
        top: spacing.lg,
        bottom: spacing.lg,
        width: '48px',
        zIndex: 50,
        cursor: 'pointer'
      }}
    >
      <ScrollbarTrack />
      <ScrollbarThumb
        position={thumbPosition}
        height={thumbHeight}
        isDragging={isDragging}
        isHovering={isHovering}
        onMouseDown={handleMouseDown}
      />
      <ScrollbarIndicator position={indicatorPosition} />
    </div>
  )
}
