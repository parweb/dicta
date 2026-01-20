import { useThemeStore } from '@/hooks/useThemeStore'
import type { Transcription } from '../../../lib/history'
import HourRuler from './HourRuler'

export interface DailyCell {
  dateKey: string
  dayLabel: string
  fullDate: string
  count: number
  transcriptions: Transcription[]
}

interface TimelineRowProps {
  cell: DailyCell
  isHovered: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export default function TimelineRow({
  cell,
  isHovered,
  onMouseEnter,
  onMouseLeave
}: TimelineRowProps) {
  const { theme } = useThemeStore()
  const { colors, spacing, typography } = theme

  const cellAvgDuration =
    cell.transcriptions.reduce((sum, t) => sum + (t.durationMs || 0), 0) / cell.count / 1000
  const cellTotalDuration =
    cell.transcriptions.reduce((sum, t) => sum + (t.durationMs || 0), 0) / 1000

  return (
    <div
      className="timeline-row"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        transition: 'all 0.15s ease-out'
      }}
    >
      {/* Main timeline row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing.md
        }}
      >
        {/* Minimal date label */}
        <div
          className="date-label"
          style={{
            fontSize: typography.fontSize.xs,
            color: isHovered ? colors.text.secondary : colors.text.tertiary,
            minWidth: '50px',
            textAlign: 'right',
            transition: 'color 0.15s ease-out',
            fontWeight: typography.fontWeight.medium
          }}
        >
          {cell.dayLabel}
        </div>

        {/* Timeline graph - 24 hours */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Timeline with markers */}
          <div
            style={{
              position: 'relative',
              height: '32px',
              width: '100%'
            }}
          >
            {/* Timeline axis */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: '1px',
                backgroundColor: colors.border.primary,
                opacity: isHovered ? 0.6 : 0.3,
                transition: 'opacity 0.15s ease-out'
              }}
            />

            {/* Transcription markers */}
            {cell.transcriptions.map((t, idx) => {
              const date = new Date(t.timestamp)
              const hours = date.getHours()
              const minutes = date.getMinutes()
              const seconds = date.getSeconds()
              const totalSeconds = hours * 3600 + minutes * 60 + seconds
              const position = (totalSeconds / 86400) * 100 // 86400 seconds in a day
              const duration = t.durationMs || 0
              const maxDuration = Math.max(
                ...cell.transcriptions.map((t) => t.durationMs || 0),
                1
              )
              const baseSize = 6
              const size = Math.max(baseSize, (duration / maxDuration) * 10 + baseSize)

              return (
                <div
                  key={`${t.id}-${idx}`}
                  style={{
                    position: 'absolute',
                    left: `${position}%`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: `${size}px`,
                    height: `${size}px`,
                    backgroundColor: colors.accent.blue.primary,
                    borderRadius: '50%',
                    border: 'none',
                    boxShadow: isHovered
                      ? '0 2px 8px rgba(14, 165, 233, 0.5)'
                      : '0 1px 4px rgba(14, 165, 233, 0.3)',
                    zIndex: cell.transcriptions.length - idx,
                    opacity: isHovered ? 1 : 0.8,
                    transition: 'all 0.15s ease-out',
                    animation: `markerFadeIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 0.03}s both`
                  }}
                />
              )
            })}
          </div>

          {/* Hour ruler - appears on hover */}
          {isHovered && <HourRuler />}
        </div>
      </div>

      {/* Stats below - appears on hover */}
      <div
        className="row-stats"
        style={{
          display: 'flex',
          gap: spacing.md,
          fontSize: typography.fontSize.xs,
          color: colors.text.tertiary,
          alignItems: 'center',
          paddingLeft: '64px',
          paddingTop: isHovered ? spacing.xs : '0',
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'translateY(0)' : 'translateY(-4px)',
          transition:
            'max-height 0.4s cubic-bezier(0.23, 1, 0.32, 1), padding-top 0.4s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.5s cubic-bezier(0.23, 1, 0.32, 1) 0.15s, transform 0.5s cubic-bezier(0.23, 1, 0.32, 1) 0.15s',
          pointerEvents: 'none',
          maxHeight: isHovered ? '50px' : '0',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.secondary,
            minWidth: '20px'
          }}
        >
          {cell.count}
        </div>
        <div
          style={{
            width: '1px',
            height: '12px',
            backgroundColor: colors.border.primary,
            opacity: 0.5
          }}
        />
        <div
          style={{
            display: 'flex',
            gap: spacing.xs,
            alignItems: 'baseline'
          }}
        >
          <span style={{ opacity: 0.6, fontSize: '10px' }}>moy</span>
          <span
            style={{
              color: colors.text.secondary,
              fontWeight: typography.fontWeight.medium
            }}
          >
            {cellAvgDuration.toFixed(1)}s
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            gap: spacing.xs,
            alignItems: 'baseline'
          }}
        >
          <span style={{ opacity: 0.6, fontSize: '10px' }}>total</span>
          <span
            style={{
              color: colors.text.secondary,
              fontWeight: typography.fontWeight.medium
            }}
          >
            {cellTotalDuration >= 60
              ? `${(cellTotalDuration / 60).toFixed(1)}m`
              : `${cellTotalDuration.toFixed(0)}s`}
          </span>
        </div>
      </div>
    </div>
  )
}
