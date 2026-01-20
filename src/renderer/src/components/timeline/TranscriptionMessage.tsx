/**
 * Transcription Message Component
 * Displays a transcription message with waveform, timestamp, and actions
 * OPTIMIZED with React.memo and decomposed into smaller components
 */

import { memo } from 'react'
import { useTheme } from '@/lib/theme-context'
import MessageWaveform from './MessageWaveform'
import MessageHeader from './MessageHeader'
import MessageContent from './MessageContent'

interface TranscriptionMessageProps {
  text: string
  audioAmplitudes?: number[]
  audioDuration?: number
  timestamp: number
  onCopy?: () => void
  onOpenActions?: () => void
}

const TranscriptionMessage = memo(function TranscriptionMessage({
  text,
  audioAmplitudes = [],
  audioDuration,
  timestamp,
  onCopy,
  onOpenActions
}: TranscriptionMessageProps) {
  const { theme } = useTheme()
  const { colors, spacing } = theme

  return (
    <div
      style={{
        display: 'flex',
        gap: spacing.lg,
        padding: spacing.lg,
        backgroundColor: colors.background.secondary + '20',
        border: `1px solid ${colors.border.primary}`,
        borderRadius: '8px',
        marginBottom: spacing.md,
        WebkitAppRegion: 'no-drag'
      } as React.CSSProperties}
    >
      {/* Audio Waveform Section */}
      <MessageWaveform amplitudes={audioAmplitudes} duration={audioDuration} />

      {/* Text Content Section */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <MessageHeader timestamp={timestamp} onCopy={onCopy} onOpenActions={onOpenActions} />
        <MessageContent text={text} />
      </div>
    </div>
  )
})

export default TranscriptionMessage
