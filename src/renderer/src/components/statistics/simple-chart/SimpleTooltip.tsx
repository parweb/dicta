import { useThemeStore } from '@/hooks/useThemeStore'
import type { HourlyCell } from '../enhanced-chart/HeatmapGrid'

interface SimpleTooltipProps {
  cell: HourlyCell
  mousePosition: { x: number; y: number }
}

export default function SimpleTooltip({ cell, mousePosition }: SimpleTooltipProps) {
  const { theme } = useThemeStore()
  const { colors, spacing, typography, borderRadius } = theme

  return (
    <div
      style={{
        position: 'fixed',
        left: `${mousePosition.x + 10}px`,
        top: `${mousePosition.y + 10}px`,
        backgroundColor: colors.background.primary,
        border: `1px solid ${colors.border.primary}`,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        zIndex: 1000,
        pointerEvents: 'none',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
      }}
    >
      <div
        style={{
          fontSize: typography.fontSize.sm,
          color: colors.text.tertiary,
          marginBottom: spacing.xs
        }}
      >
        {cell.dayLabel} à {String(cell.hour).padStart(2, '0')}h
      </div>
      <div
        style={{
          fontSize: typography.fontSize.base,
          color: colors.text.primary,
          fontWeight: typography.fontWeight.semibold
        }}
      >
        {cell.count} transcriptions
      </div>
      {cell.count > 0 && (
        <div
          style={{
            fontSize: typography.fontSize.xs,
            color: colors.accent.primary.primary,
            marginTop: spacing.xs
          }}
        >
          Cliquez pour voir les détails
        </div>
      )}
    </div>
  )
}
