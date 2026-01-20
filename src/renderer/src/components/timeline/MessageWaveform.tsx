/**
 * Message Waveform Component
 * Displays audio waveform with duration
 */

import { memo } from 'react'
import { useThemeStore } from '@/hooks/useThemeStore'
import AudioWaveform from '../AudioWaveform'

interface MessageWaveformProps {
  amplitudes: number[]
  duration?: number
}

const MessageWaveform = memo(function MessageWaveform({
  amplitudes,
  duration
}: MessageWaveformProps) {
  const { theme } = useThemeStore()
  const { spacing, typography, colors } = theme

  if (amplitudes.length === 0) return null

  return (
    <div
      style={{
        flex: '0 0 auto',
        minWidth: '200px',
        maxWidth: '300px',
        width: '25%',
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.xs
      }}
    >
      <AudioWaveform amplitudes={amplitudes} height={60} showDuration={false} />
      {duration && (
        <div
          style={{
            fontSize: typography.fontSize.xs,
            color: colors.text.tertiary,
            textAlign: 'center'
          }}
        >
          {`${(duration / 1000).toFixed(1)}s`}
        </div>
      )}
    </div>
  )
})

export default MessageWaveform
