import { Ruler } from 'lucide-react'
import { useThemeStore } from '@/hooks/useThemeStore'
import Section from '../layout/Section'

export default function SpacingSection() {
  const { theme, setTheme } = useThemeStore()
  const { colors, spacing, typography } = theme

  return (
    <Section
      icon={<Ruler size={20} />}
      title="Espacement"
      description="Ajustez les espacements pour modifier la densité de l'interface"
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.lg
        }}
      >
        {(['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const).map((size) => (
          <div
            key={size}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.xl
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
              {size.toUpperCase()}
            </div>
            <div
              style={{
                height: '24px',
                width: spacing[size],
                backgroundColor: colors.accent.primary.primary,
                borderRadius: theme.borderRadius.sm,
                transition: 'width 0.2s'
              }}
            />
            <input
              type="range"
              min="0"
              max="60"
              value={parseInt(spacing[size])}
              onChange={(e) => {
                const value = `${e.target.value}px`
                setTheme({ spacing: { [size]: value } })
              }}
              style={{
                flex: 1,
                accentColor: colors.accent.primary.primary
              }}
            />
            <div
              style={{
                width: '60px',
                fontSize: typography.fontSize.xs,
                color: colors.text.tertiary,
                fontFamily: 'monospace',
                textAlign: 'right'
              }}
            >
              {spacing[size]}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
