/**
 * Scrollbar Track Component
 * Vertical track line for scrollbar
 */

import { memo } from 'react'
import { useThemeStore } from '@/hooks/useThemeStore'

const ScrollbarTrack = memo(function ScrollbarTrack() {
  const { theme } = useThemeStore()
  const { colors } = theme

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: 0,
        bottom: 0,
        width: '3px',
        transform: 'translateX(-50%)',
        backgroundColor: colors.accent.primary.primary + '40',
        borderRadius: '2px'
      }}
    />
  )
})

export default ScrollbarTrack
