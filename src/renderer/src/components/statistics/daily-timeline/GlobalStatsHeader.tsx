import { useTheme } from '@/lib/theme-context'

interface GlobalStatsHeaderProps {
  totalCount: number
  totalDuration: number
  avgDuration: number
}

export default function GlobalStatsHeader({
  totalCount,
  totalDuration,
  avgDuration
}: GlobalStatsHeaderProps) {
  const { theme } = useTheme()
  const { colors, spacing, typography } = theme

  return (
    <div
      className="global-stats"
      style={{
        maxWidth: '1000px',
        margin: '0 auto',
        marginBottom: spacing.lg,
        display: 'flex',
        justifyContent: 'flex-end',
        gap: spacing.xl,
        paddingRight: '80px',
        fontSize: typography.fontSize.xs,
        color: colors.text.tertiary,
        animation: 'statsIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both'
      }}
    >
      <div style={{ display: 'flex', gap: spacing.xs, alignItems: 'baseline' }}>
        <span style={{ opacity: 0.6 }}>Total</span>
        <span
          style={{
            color: colors.text.secondary,
            fontWeight: typography.fontWeight.medium
          }}
        >
          {totalCount}
        </span>
      </div>
      <div style={{ display: 'flex', gap: spacing.xs, alignItems: 'baseline' }}>
        <span style={{ opacity: 0.6 }}>Durée</span>
        <span
          style={{
            color: colors.text.secondary,
            fontWeight: typography.fontWeight.medium
          }}
        >
          {(totalDuration / 60).toFixed(0)}m
        </span>
      </div>
      <div style={{ display: 'flex', gap: spacing.xs, alignItems: 'baseline' }}>
        <span style={{ opacity: 0.6 }}>Moy.</span>
        <span
          style={{
            color: colors.text.secondary,
            fontWeight: typography.fontWeight.medium
          }}
        >
          {avgDuration.toFixed(1)}s
        </span>
      </div>
    </div>
  )
}
