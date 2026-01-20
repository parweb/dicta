/**
 * Transcription Message Component
 * Displays a transcription in conversation format with waveform
 * OPTIMIZED with React.memo to prevent unnecessary re-renders
 */

import { memo, useMemo } from 'react'
import { Copy, Sparkles } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'
import AudioWaveform from '../AudioWaveform'
import { formatDistanceToNow, format } from 'date-fns'
import { fr } from 'date-fns/locale'

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
  const { colors, spacing, typography } = theme

  // Memoize date/time formatting with relative time for recent items
  const formattedTime = useMemo(() => {
    const date = new Date(timestamp)
    const now = Date.now()
    const age = now - timestamp
    const oneDay = 24 * 60 * 60 * 1000

    // If less than 24 hours ago, show relative time
    if (age < oneDay) {
      return formatDistanceToNow(date, { addSuffix: true, locale: fr })
    }

    // Otherwise show full date + time
    return format(date, 'dd MMM yyyy à HH:mm', { locale: fr })
  }, [timestamp])

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
      {audioAmplitudes.length > 0 && (
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
          <AudioWaveform
            amplitudes={audioAmplitudes}
            height={60}
            showDuration={false}
          />
          <div
            style={{
              fontSize: typography.fontSize.xs,
              color: colors.text.tertiary,
              textAlign: 'center'
            }}
          >
            {audioDuration ? `${(audioDuration / 1000).toFixed(1)}s` : ''}
          </div>
        </div>
      )}

      {/* Text Content Section */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.sm
          }}
        >
          <span
            style={{
              fontSize: typography.fontSize.xs,
              color: colors.text.tertiary
            }}
          >
            {formattedTime}
          </span>

          <div style={{ display: 'flex', gap: spacing.xs }}>
            {onCopy && (
              <button
                onClick={onCopy}
                style={{
                  padding: spacing.xs,
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: colors.text.tertiary,
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '2px',
                  transition: 'background-color 0.15s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.background.secondary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <Copy size={14} />
              </button>
            )}
            {onOpenActions && (
              <button
                onClick={onOpenActions}
                style={{
                  padding: spacing.xs,
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: colors.accent.blue.primary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.xs,
                  borderRadius: '2px',
                  fontSize: typography.fontSize.xs,
                  transition: 'background-color 0.15s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.background.secondary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <Sparkles size={14} />
                <span>Actions</span>
              </button>
            )}
          </div>
        </div>

        {/* Transcription Text */}
        <p
          style={{
            fontSize: typography.fontSize.base,
            lineHeight: typography.lineHeight.relaxed,
            color: colors.text.primary,
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {text}
        </p>
      </div>
    </div>
  )
})

export default TranscriptionMessage
