/**
 * Scrollbar Track Component
 * Vertical track line for scrollbar
 */

import { memo } from 'react'
import { useTheme } from '@/lib/theme-context'

const ScrollbarTrack = memo(function ScrollbarTrack() {
  const { theme } = useTheme()
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
        backgroundColor: colors.accent.blue.primary + '40',
        borderRadius: '2px'
      }}
    />
  )
})

export default ScrollbarTrack
