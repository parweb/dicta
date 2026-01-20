import { useThemeStore } from '@/hooks/useThemeStore'
import type { HourlyCell } from '../enhanced-chart/HeatmapGrid'

interface DetailsPanelProps {
  cell: HourlyCell
  onClose: () => void
}

export default function DetailsPanel({ cell, onClose }: DetailsPanelProps) {
  const { theme } = useThemeStore()
  const { colors, spacing, typography, borderRadius } = theme

  return (
    <div
      style={{
        width: '350px',
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        border: `1px solid ${colors.border.primary}`,
        maxHeight: '600px',
        overflowY: 'auto',
        flexShrink: 0
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.lg
        }}
      >
        <h4
          style={{
            fontSize: typography.fontSize.base,
            color: colors.text.primary,
            fontWeight: typography.fontWeight.semibold,
            margin: 0
          }}
        >
          Détails
        </h4>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: colors.text.tertiary,
            cursor: 'pointer',
            fontSize: typography.fontSize.lg,
            padding: 0
          }}
        >
          ×
        </button>
      </div>

      <div
        style={{
          fontSize: typography.fontSize.sm,
          color: colors.text.tertiary,
          marginBottom: spacing.md
        }}
      >
        {cell.dayLabel} à {String(cell.hour).padStart(2, '0')}h
      </div>

      <div
        style={{
          marginBottom: spacing.lg,
          padding: spacing.md,
          backgroundColor: colors.background.primary,
          borderRadius: borderRadius.md
        }}
      >
        <div
          style={{
            fontSize: typography.fontSize.lg,
            color: colors.accent.blue.primary,
            fontWeight: typography.fontWeight.bold
          }}
        >
          {cell.count} transcriptions
        </div>
      </div>

      <div
        style={{
          fontSize: typography.fontSize.sm,
          color: colors.text.secondary,
          marginBottom: spacing.sm,
          fontWeight: typography.fontWeight.medium
        }}
      >
        Liste ({cell.transcriptions.length})
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.xs
        }}
      >
        {cell.transcriptions.map((t) => {
          const date = new Date(t.timestamp)
          return (
            <div
              key={t.id}
              style={{
                padding: spacing.sm,
                backgroundColor: colors.background.primary,
                borderRadius: borderRadius.sm,
                fontSize: typography.fontSize.xs
              }}
            >
              <div
                style={{
                  color: colors.text.secondary,
                  marginBottom: spacing.xs
                }}
              >
                {date.getHours()}:{String(date.getMinutes()).padStart(2, '0')}
              </div>
              <div
                style={{
                  color: colors.text.tertiary,
                  fontSize: typography.fontSize.xs
                }}
              >
                {t.durationMs ? `${(t.durationMs / 1000).toFixed(1)}s` : 'N/A'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
