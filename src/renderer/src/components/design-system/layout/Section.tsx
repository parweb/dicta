import { useTheme } from '@/lib/theme-context'

interface SectionProps {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}

export default function Section({ icon, title, description, children }: SectionProps) {
  const { theme } = useTheme()
  const { colors, spacing, typography } = theme

  return (
    <div
      style={{
        marginBottom: spacing['4xl']
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing.md,
          marginBottom: spacing.md
        }}
      >
        <div style={{ color: colors.accent.blue.primary }}>{icon}</div>
        <h2
          style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary
          }}
        >
          {title}
        </h2>
      </div>
      <p
        style={{
          fontSize: typography.fontSize.sm,
          color: colors.text.tertiary,
          marginBottom: spacing.xl,
          lineHeight: typography.lineHeight.relaxed
        }}
      >
        {description}
      </p>
      {children}
    </div>
  )
}
