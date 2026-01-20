/**
 * Theme Provider Component
 * Injects CSS variables from the theme into the DOM
 */

import { useEffect } from 'react'
import { useThemeStore } from '@/hooks/useThemeStore'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore()

  useEffect(() => {
    if (!theme) return

    const root = document.documentElement
    const { colors, spacing, typography, borderRadius } = theme

    // Background colors
    root.style.setProperty('--color-bg-primary', colors.background.primary)
    root.style.setProperty('--color-bg-secondary', colors.background.secondary)
    root.style.setProperty('--color-bg-tertiary', colors.background.tertiary)
    root.style.setProperty('--color-bg-overlay', colors.background.overlay)

    // Text colors
    root.style.setProperty('--color-text-primary', colors.text.primary)
    root.style.setProperty('--color-text-secondary', colors.text.secondary)
    root.style.setProperty('--color-text-tertiary', colors.text.tertiary)
    root.style.setProperty('--color-text-disabled', colors.text.disabled)

    // Border colors
    root.style.setProperty('--color-border-primary', colors.border.primary)
    root.style.setProperty('--color-border-secondary', colors.border.secondary)
    root.style.setProperty('--color-border-accent', colors.border.accent)

    // Accent colors
    root.style.setProperty('--color-accent-primary', colors.accent.blue.primary)
    root.style.setProperty('--color-accent-light', colors.accent.blue.light)
    root.style.setProperty('--color-accent-dark', colors.accent.blue.dark)
    root.style.setProperty('--color-accent-bg', colors.accent.blue.background)
    root.style.setProperty('--color-accent-bg-hover', colors.accent.blue.backgroundHover)

    // Purple accents (AI/Bedrock)
    root.style.setProperty('--color-purple-primary', colors.accent.purple.primary)
    root.style.setProperty('--color-purple-light', colors.accent.purple.light)
    root.style.setProperty('--color-purple-dark', colors.accent.purple.dark)
    root.style.setProperty('--color-purple-bg', colors.accent.purple.background)
    root.style.setProperty('--color-purple-bg-hover', colors.accent.purple.backgroundHover)
    root.style.setProperty('--color-purple-border', colors.accent.purple.border)

    // Green accents
    root.style.setProperty('--color-success', colors.accent.green.primary)
    root.style.setProperty('--color-success-button', colors.accent.green.button)

    // Red accents
    root.style.setProperty('--color-error', colors.accent.red.primary)
    root.style.setProperty('--color-error-button', colors.accent.red.button)

    // Yellow accents
    root.style.setProperty('--color-warning', colors.accent.yellow.primary)
    root.style.setProperty('--color-warning-light', colors.accent.yellow.light)
    root.style.setProperty('--color-warning-bg', colors.accent.yellow.background)

    // Gray accents
    root.style.setProperty('--color-gray', colors.accent.gray.primary)
    root.style.setProperty('--color-gray-light', colors.accent.gray.light)

    // State colors
    root.style.setProperty('--color-state-success', colors.state.success)
    root.style.setProperty('--color-state-error', colors.state.error)
    root.style.setProperty('--color-state-loading', colors.state.loading)

    // Spacing
    root.style.setProperty('--spacing-xs', spacing.xs)
    root.style.setProperty('--spacing-sm', spacing.sm)
    root.style.setProperty('--spacing-md', spacing.md)
    root.style.setProperty('--spacing-lg', spacing.lg)
    root.style.setProperty('--spacing-xl', spacing.xl)
    root.style.setProperty('--spacing-2xl', spacing['2xl'])

    // Typography
    root.style.setProperty('--font-size-xs', typography.fontSize.xs)
    root.style.setProperty('--font-size-sm', typography.fontSize.sm)
    root.style.setProperty('--font-size-base', typography.fontSize.base)
    root.style.setProperty('--font-size-lg', typography.fontSize.lg)
    root.style.setProperty('--font-size-xl', typography.fontSize.xl)

    // Border radius
    root.style.setProperty('--radius-sm', borderRadius.sm)
    root.style.setProperty('--radius-md', borderRadius.md)
    root.style.setProperty('--radius-lg', borderRadius.lg)
    root.style.setProperty('--radius-full', borderRadius.full)
  }, [theme])

  return <>{children}</>
}
