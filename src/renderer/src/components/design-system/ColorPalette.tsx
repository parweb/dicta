import type { ThemeConfig } from '@/lib/theme-schema'
import { useThemeStore } from '@/hooks/useThemeStore'

interface ColorPaletteProps {
  theme: ThemeConfig
  size?: 'sm' | 'md' | 'lg'
  layout?: 'horizontal' | 'grid'
}

/**
 * ColorPalette - Displays a preview of theme colors
 *
 * Shows 6 key colors from the theme:
 * - Primary accent
 * - Secondary accent
 * - Success
 * - Error
 * - Warning
 * - Muted
 */
export default function ColorPalette({
  theme: previewTheme,
  size = 'sm',
  layout = 'grid'
}: ColorPaletteProps) {
  const { theme } = useThemeStore()

  const colors = [
    { name: 'Primary', value: previewTheme.colors.accent.primary.primary },
    { name: 'Secondary', value: previewTheme.colors.accent.secondary.primary },
    { name: 'Success', value: previewTheme.colors.accent.success.primary },
    { name: 'Error', value: previewTheme.colors.accent.error.primary },
    { name: 'Warning', value: previewTheme.colors.accent.warning.primary },
    { name: 'Muted', value: previewTheme.colors.accent.muted.primary }
  ]

  const sizeMap = { sm: 16, md: 24, lg: 32 }
  const dimension = sizeMap[size]

  return (
    <div
      style={{
        display: layout === 'grid' ? 'grid' : 'flex',
        gridTemplateColumns: layout === 'grid' ? 'repeat(3, 1fr)' : undefined,
        gap: theme.spacing.xs,
        marginTop: theme.spacing.sm
      }}
    >
      {colors.map(({ name, value }) => (
        <div
          key={name}
          title={`${name}: ${value}`}
          style={{
            width: dimension,
            height: dimension,
            backgroundColor: value,
            borderRadius: theme.borderRadius.sm,
            border: `1px solid ${theme.colors.border.primary}`,
            cursor: 'help',
            transition: 'transform 0.2s ease',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
        />
      ))}
    </div>
  )
}
