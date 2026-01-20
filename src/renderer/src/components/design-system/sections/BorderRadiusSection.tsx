import { Circle } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'
import Section from '../layout/Section'

export default function BorderRadiusSection() {
  const { theme } = useTheme()
  const { colors, spacing, typography, borderRadius } = theme

  return (
    <Section
      icon={<Circle size={20} />}
      title="Border Radius"
      description="Arrondis pour les éléments de l'interface"
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: spacing.xl
        }}
      >
        {Object.entries(borderRadius).map(([key, value]) => (
          <div
            key={key}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: spacing.md
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                backgroundColor: colors.accent.blue.primary,
                borderRadius: value === '50%' ? value : value
              }}
            />
            <div
              style={{
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.secondary
              }}
            >
              {key}
            </div>
            <div
              style={{
                fontSize: typography.fontSize.xs,
                color: colors.text.tertiary,
                fontFamily: 'monospace'
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
