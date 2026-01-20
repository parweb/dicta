import { useThemeStore } from '@/hooks/useThemeStore'

interface ColorCardProps {
  name: string
  hex: string
}

export default function ColorCard({ name, hex }: ColorCardProps) {
  const { theme } = useThemeStore()
  const { colors, spacing, typography, borderRadius, borders } = theme

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.sm
      }}
    >
      <div
        style={{
          height: '80px',
          backgroundColor: hex,
          borderRadius: borderRadius.md,
          border: borders.light
        }}
      />
      <div
        style={{
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          color: colors.text.secondary
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontSize: typography.fontSize.xs,
          color: colors.text.tertiary,
          fontFamily: 'monospace'
        }}
      >
        {hex}
      </div>
    </div>
  )
}
