/**
 * Transcription Message Component
 * Displays a transcription in conversation format with waveform
 */

import { Copy, Sparkles } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'
import AudioWaveform from '../AudioWaveform'

interface TranscriptionMessageProps {
  text: string
  audioAmplitudes?: number[]
  audioDuration?: number
  timestamp: number
  onCopy?: () => void
  onOpenActions?: () => void
}

export default function TranscriptionMessage({
  text,
  audioAmplitudes = [],
  audioDuration,
  timestamp,
  onCopy,
  onOpenActions
}: TranscriptionMessageProps) {
  const { theme } = useTheme()
  const { colors, spacing, typography } = theme

  const formattedTime = new Date(timestamp).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div
      style={{
        position: 'relative',
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
      {/* Connection line to timeline */}
      <div
        style={{
          position: 'absolute',
          left: '-60px',
          top: '50%',
          width: '40px',
          height: '2px',
          backgroundColor: colors.border.primary,
          transform: 'translateY(-50%)'
        }}
      />
      {/* Audio Waveform Section */}
      {audioAmplitudes.length > 0 && (
        <div
          style={{
            flexShrink: 0,
            width: '120px',
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
}
