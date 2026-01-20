import { useThemeStore } from '@/hooks/useThemeStore'
import type { HourlyCell } from './HeatmapGrid'

interface HoverTooltipProps {
  cell: HourlyCell
  mousePosition: { x: number; y: number }
}

export default function HoverTooltip({ cell, mousePosition }: HoverTooltipProps) {
  const { theme } = useThemeStore()
  const { colors, spacing, typography, borderRadius } = theme

  const avgDuration =
    cell.transcriptions.reduce((sum, t) => sum + (t.durationMs || 0), 0) /
    cell.count /
    1000

  return (
    <div
      style={{
        position: 'fixed',
        left: `${mousePosition.x + 16}px`,
        top: `${mousePosition.y + 16}px`,
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        borderRadius: borderRadius.md,
        padding: spacing.md,
        zIndex: 1000,
        pointerEvents: 'none',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        width: '260px',
        animation: 'tooltipIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        backdropFilter: 'blur(12px)'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: spacing.md,
          paddingBottom: spacing.sm,
          borderBottom: `1px solid ${colors.border.primary}`
        }}
      >
        <div
          style={{
            fontSize: typography.fontSize.xs,
            color: colors.text.tertiary
          }}
        >
          {cell.dayLabel} · {String(cell.hour).padStart(2, '0')}h
        </div>
        <div
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.primary,
            fontWeight: typography.fontWeight.semibold
          }}
        >
          {cell.count}
        </div>
      </div>

      {/* Mini timeline graph */}
      <div
        style={{
          position: 'relative',
          height: '50px',
          backgroundColor: colors.background.primary,
          borderRadius: borderRadius.sm,
          marginBottom: spacing.sm,
          overflow: 'hidden'
        }}
      >
        {/* Timeline container with padding */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '12px',
            right: '12px',
            bottom: 0
          }}
        >
          {/* Timeline axis */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: '2px',
              backgroundColor: colors.border.secondary,
              borderRadius: '1px'
            }}
          />

          {/* Transcription markers */}
          {cell.transcriptions.map((t, idx) => {
            const date = new Date(t.timestamp)
            const minute = date.getMinutes()
            const seconds = date.getSeconds()
            const totalSeconds = minute * 60 + seconds
            const position = (totalSeconds / 3600) * 100
            const duration = t.durationMs || 0
            const maxDuration = Math.max(...cell.transcriptions.map((t) => t.durationMs || 0), 1)
            const size = Math.max(7, (duration / maxDuration) * 14 + 7)

            return (
              <div
                key={t.id}
                title={`${minute}:${String(seconds).padStart(2, '0')}`}
                style={{
                  position: 'absolute',
                  left: `${position}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: `${size}px`,
                  height: `${size}px`,
                  backgroundColor: colors.accent.primary.primary,
                  borderRadius: '50%',
                  border: `2px solid ${colors.background.primary}`,
                  boxShadow: '0 2px 8px rgba(14, 165, 233, 0.4)',
                  zIndex: cell.transcriptions.length - idx,
                  animation: `markerIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 0.04}s both`
                }}
              />
            )
          })}
        </div>

        {/* Time markers */}
        <div
          style={{
            position: 'absolute',
            bottom: '4px',
            left: '12px',
            fontSize: '9px',
            color: colors.text.tertiary,
            fontWeight: typography.fontWeight.medium
          }}
        >
          00
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '4px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '9px',
            color: colors.text.tertiary,
            fontWeight: typography.fontWeight.medium
          }}
        >
          30
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '4px',
            right: '12px',
            fontSize: '9px',
            color: colors.text.tertiary,
            fontWeight: typography.fontWeight.medium
          }}
        >
          60
        </div>
      </div>

      {/* Stats footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '10px',
          color: colors.text.tertiary
        }}
      >
        <span>Durée moy.</span>
        <span
          style={{
            color: colors.accent.primary.primary,
            fontWeight: typography.fontWeight.medium
          }}
        >
          {avgDuration.toFixed(1)}s
        </span>
      </div>
    </div>
  )
}
