import { Type } from 'lucide-react'
import { useThemeStore } from '@/hooks/useThemeStore'
import Section from '../layout/Section'

export default function TypographySection() {
  const { theme, setTheme } = useThemeStore()
  const { colors, spacing, typography } = theme

  return (
    <Section
      icon={<Type size={20} />}
      title="Typographie"
      description="Modifiez les tailles de police pour ajuster la hiérarchie du texte"
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.lg
        }}
      >
        {(['xs', 'sm', 'base', 'lg', 'xl'] as const).map((size) => (
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
                flex: 1,
                fontSize: typography.fontSize[size],
                color: colors.text.primary,
                transition: 'font-size 0.2s'
              }}
            >
              The quick brown fox
            </div>
            <input
              type="range"
              min="8"
              max="48"
              value={parseInt(typography.fontSize[size])}
              onChange={(e) => {
                const value = `${e.target.value}px`
                setTheme({ typography: { fontSize: { [size]: value } } })
              }}
              style={{
                width: '200px',
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
              {typography.fontSize[size]}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
