import { useTheme } from '@/lib/theme-context'

export default function HeatmapLegend() {
  const { theme } = useTheme()
  const { colors, spacing, typography, borderRadius } = theme

  const cellSize = 14

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing.sm,
        marginTop: spacing.lg,
        fontSize: typography.fontSize.xs,
        color: colors.text.tertiary
      }}
    >
      <span>Moins</span>
      {[0, 0.25, 0.5, 0.75, 1].map((intensity, idx) => (
        <div
          key={idx}
          style={{
            width: `${cellSize}px`,
            height: `${cellSize}px`,
            backgroundColor:
              intensity === 0
                ? colors.background.tertiary
                : `rgba(14, 165, 233, ${0.2 + intensity * 0.8})`,
            borderRadius: borderRadius.xs,
            border: `1px solid ${colors.border.primary}`
          }}
        />
      ))}
      <span>Plus</span>
    </div>
  )
}
