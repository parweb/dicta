import { useTheme } from '@/lib/theme-context'
import Section from '../layout/Section'
import BarChart3Icon from '../icons/BarChart3Icon'

export default function ChartsSection() {
  const { theme } = useTheme()
  const { colors, spacing, typography, borderRadius, charts } = theme

  return (
    <Section
      icon={<BarChart3Icon size={20} />}
      title="Graphiques"
      description="Couleurs pour les visualisations de données"
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.lg
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.xl
          }}
        >
          <div
            style={{
              width: '120px',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.secondary
            }}
          >
            Bar Fill
          </div>
          <div
            style={{
              width: '80px',
              height: '40px',
              backgroundColor: charts.bar.fill,
              borderRadius: borderRadius.sm
            }}
          />
          <div
            style={{
              fontSize: typography.fontSize.xs,
              color: colors.text.tertiary,
              fontFamily: 'monospace'
            }}
          >
            {charts.bar.fill}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.xl
          }}
        >
          <div
            style={{
              width: '120px',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.secondary
            }}
          >
            Brush Stroke
          </div>
          <div
            style={{
              width: '80px',
              height: '40px',
              backgroundColor: charts.brush.stroke,
              borderRadius: borderRadius.sm
            }}
          />
          <div
            style={{
              fontSize: typography.fontSize.xs,
              color: colors.text.tertiary,
              fontFamily: 'monospace'
            }}
          >
            {charts.brush.stroke}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.xl
          }}
        >
          <div
            style={{
              width: '120px',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.secondary
            }}
          >
            Brush Fill
          </div>
          <div
            style={{
              width: '80px',
              height: '40px',
              backgroundColor: charts.brush.fill,
              border: `2px solid ${colors.border.primary}`,
              borderRadius: borderRadius.sm
            }}
          />
          <div
            style={{
              fontSize: typography.fontSize.xs,
              color: colors.text.tertiary,
              fontFamily: 'monospace'
            }}
          >
            {charts.brush.fill}
          </div>
        </div>
      </div>
    </Section>
  )
}
