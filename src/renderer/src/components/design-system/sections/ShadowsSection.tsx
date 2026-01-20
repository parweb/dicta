import { Sparkles } from 'lucide-react'
import { useThemeStore } from '@/hooks/useThemeStore'
import Section from '../layout/Section'

export default function ShadowsSection() {
  const { theme } = useThemeStore()
  const { colors, spacing, typography, borderRadius, shadows } = theme

  return (
    <Section
      icon={<Sparkles size={20} />}
      title="Ombres"
      description="Élévations pour créer de la profondeur"
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: spacing.xl
        }}
      >
        {Object.entries(shadows).map(([key, value]) => (
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
                width: '100px',
                height: '100px',
                backgroundColor: colors.background.secondary,
                borderRadius: borderRadius.md,
                boxShadow: value
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
          </div>
        ))}
      </div>
    </Section>
  )
}
