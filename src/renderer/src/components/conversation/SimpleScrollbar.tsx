/**
 * Simple Custom Scrollbar
 * Clean, minimal, always works
 */

import { useEffect, useRef, useState } from 'react'
import { useTheme } from '@/lib/theme-context'

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
  const { theme } = useTheme()
  const { colors, spacing } = theme
  const trackRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const dragStartRef = useRef<{ y: number; scrollProgress: number } | null>(null)

  // Calculate thumb size and position
  const thumbHeight = 80 // Fixed size for simplicity
  const trackHeight = trackRef.current?.clientHeight || 500
  const thumbPosition = scrollProgress * (trackHeight - thumbHeight)

  // Handle thumb drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    dragStartRef.current = {
      y: e.clientY,
      scrollProgress
    }
  }

  // Handle drag
  useEffect(() => {
    if (!isDragging || !dragStartRef.current) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!trackRef.current || !dragStartRef.current) return

      const rect = trackRef.current.getBoundingClientRect()
      const deltaY = e.clientY - dragStartRef.current.y
      const deltaProgress = deltaY / (rect.height - thumbHeight)
      const newProgress = Math.max(0, Math.min(1, dragStartRef.current.scrollProgress + deltaProgress))

      onScroll(newProgress)
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
  }, [isDragging, onScroll, thumbHeight])

  // Handle track click
  const handleTrackClick = (e: React.MouseEvent) => {
    if (!trackRef.current) return
    if (e.target !== trackRef.current) return // Only clicks on track, not thumb

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
      {/* Track */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          bottom: 0,
          width: '3px',
          transform: 'translateX(-50%)',
          backgroundColor: colors.accent.blue.primary + '40',
          borderRadius: '2px'
        }}
      />

      {/* Thumb */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          position: 'absolute',
          left: '50%',
          top: `${thumbPosition}px`,
          width: isHovering || isDragging ? '16px' : '12px',
          height: `${thumbHeight}px`,
          transform: 'translateX(-50%)',
          background: isDragging
            ? `linear-gradient(135deg, ${colors.accent.blue.primary} 0%, ${colors.accent.blue.light} 50%, ${colors.accent.blue.primary} 100%)`
            : `linear-gradient(135deg, ${colors.accent.blue.primary}E0 0%, ${colors.accent.blue.light}C0 100%)`,
          borderRadius: '8px',
          transition: isDragging ? 'none' : 'width 0.2s, box-shadow 0.2s',
          cursor: isDragging ? 'grabbing' : 'grab',
          boxShadow: isDragging
            ? `0 0 20px ${colors.accent.blue.primary}E0`
            : isHovering
            ? `0 0 12px ${colors.accent.blue.primary}80`
            : `0 0 8px ${colors.accent.blue.primary}60`,
          border: `1px solid ${colors.accent.blue.light}40`
        }}
      />

      {/* Current position indicator */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: `${(currentIndex / Math.max(1, itemCount - 1)) * trackHeight}px`,
          width: '8px',
          height: '8px',
          transform: 'translate(-50%, -50%)',
          background: '#fbbf24',
          borderRadius: '50%',
          boxShadow: '0 0 12px rgba(251, 191, 36, 0.8)',
          border: '2px solid #f59e0b',
          pointerEvents: 'none',
          zIndex: 10
        }}
      />
    </div>
  )
}
