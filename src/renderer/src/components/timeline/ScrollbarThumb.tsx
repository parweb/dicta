/**
 * Scrollbar Thumb Component
 * Draggable scroll handle
 */

import { memo } from 'react'
import { useThemeStore } from '@/hooks/useThemeStore'

interface ScrollbarThumbProps {
  position: number
  height: number
  isDragging: boolean
  isHovering: boolean
  onMouseDown: (e: React.MouseEvent) => void
}

const ScrollbarThumb = memo(function ScrollbarThumb({
  position,
  height,
  isDragging,
  isHovering,
  onMouseDown
}: ScrollbarThumbProps) {
  const { theme } = useThemeStore()
  const { colors } = theme

  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        position: 'absolute',
        left: '50%',
        top: `${position}px`,
        width: isHovering || isDragging ? '16px' : '12px',
        height: `${height}px`,
        transform: 'translateX(-50%)',
        background: isDragging
          ? `linear-gradient(135deg, ${colors.accent.primary.primary} 0%, ${colors.accent.primary.light} 50%, ${colors.accent.primary.primary} 100%)`
          : `linear-gradient(135deg, ${colors.accent.primary.primary}E0 0%, ${colors.accent.primary.light}C0 100%)`,
        borderRadius: '8px',
        transition: isDragging ? 'none' : 'width 0.2s, box-shadow 0.2s',
        cursor: isDragging ? 'grabbing' : 'grab',
        boxShadow: isDragging
          ? `0 0 20px ${colors.accent.primary.primary}E0`
          : isHovering
          ? `0 0 12px ${colors.accent.primary.primary}80`
          : `0 0 8px ${colors.accent.primary.primary}60`,
        border: `1px solid ${colors.accent.primary.light}40`
      }}
    />
  )
})

export default ScrollbarThumb
