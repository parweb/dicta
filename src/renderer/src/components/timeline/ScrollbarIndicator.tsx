/**
 * Scrollbar Indicator Component
 * Shows current position in timeline
 */

import { memo } from 'react'

interface ScrollbarIndicatorProps {
  position: number
}

const ScrollbarIndicator = memo(function ScrollbarIndicator({ position }: ScrollbarIndicatorProps) {
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: `${position}px`,
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
  )
})

export default ScrollbarIndicator
