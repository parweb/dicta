import { Ruler } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'
import Section from '../layout/Section'

export default function SpacingSection() {
  const { theme } = useTheme()
  const { colors, spacing, typography, borderRadius } = theme

  return (
    <Section
      icon={<Ruler size={20} />}
      title="Espacement"
      description="Échelle d'espacement pour une hiérarchie cohérente"
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.md
        }}
      >
        {Object.entries(spacing).map(([key, value]) => (
          <div
            key={key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.lg
            }}
          >
            <div
              style={{
                width: '80px',
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.secondary
              }}
            >
              {key}
            </div>
            <div
              style={{
                height: '24px',
                width: value,
                backgroundColor: colors.accent.blue.primary,
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
              {value}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
