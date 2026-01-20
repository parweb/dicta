import { Type } from 'lucide-react'
import { useThemeStore } from '@/hooks/useThemeStore'
import Section from '../layout/Section'
import SubSection from '../layout/SubSection'

export default function TypographySection() {
  const { theme } = useThemeStore()
  const { colors, spacing, typography } = theme

  return (
    <Section
      icon={<Type size={20} />}
      title="Typographie"
      description="Tailles de police, graisses et espacements"
    >
      {/* Font Sizes */}
      <SubSection title="Tailles de Police">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.lg
          }}
        >
          {Object.entries(typography.fontSize).map(([key, value]) => (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'baseline',
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
                {key}
              </div>
              <div
                style={{
                  fontSize: value,
                  color: colors.text.primary
                }}
              >
                The quick brown fox jumps over the lazy dog
              </div>
              <div
                style={{
                  fontSize: typography.fontSize.xs,
                  color: colors.text.tertiary,
                  fontFamily: 'monospace',
                  marginLeft: 'auto'
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </SubSection>

      {/* Font Weights */}
      <SubSection title="Graisses de Police">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.lg
          }}
        >
          {Object.entries(typography.fontWeight).map(([key, value]) => (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.xl
              }}
            >
              <div
                style={{
                  width: '100px',
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.text.secondary
                }}
              >
                {key}
              </div>
              <div
                style={{
                  fontSize: typography.fontSize.lg,
                  fontWeight: value,
                  color: colors.text.primary
                }}
              >
                The quick brown fox
              </div>
              <div
                style={{
                  fontSize: typography.fontSize.xs,
                  color: colors.text.tertiary,
                  fontFamily: 'monospace',
                  marginLeft: 'auto'
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </SubSection>
    </Section>
  )
}
