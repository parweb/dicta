import { useThemeStore } from '@/hooks/useThemeStore'

interface SubSectionProps {
  title: string
  children: React.ReactNode
}

export default function SubSection({ title, children }: SubSectionProps) {
  const { theme } = useThemeStore()
  const { colors, spacing, typography } = theme

  return (
    <div
      style={{
        marginBottom: spacing.xl
      }}
    >
      <h4
        style={{
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.semibold,
          color: colors.text.secondary,
          marginBottom: spacing.lg
        }}
      >
        {title}
      </h4>
      {children}
    </div>
  )
}
