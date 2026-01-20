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

    // Primary accent colors (main app color)
    root.style.setProperty('--color-accent-primary', colors.accent.primary.primary)
    root.style.setProperty('--color-accent-light', colors.accent.primary.light)
    root.style.setProperty('--color-accent-dark', colors.accent.primary.dark)
    root.style.setProperty('--color-accent-bg', colors.accent.primary.background)
    root.style.setProperty('--color-accent-bg-hover', colors.accent.primary.backgroundHover)

    // Secondary accent colors (AI/special features)
    root.style.setProperty('--color-secondary-primary', colors.accent.secondary.primary)
    root.style.setProperty('--color-secondary-light', colors.accent.secondary.light)
    root.style.setProperty('--color-secondary-dark', colors.accent.secondary.dark)
    root.style.setProperty('--color-secondary-bg', colors.accent.secondary.background)
    root.style.setProperty('--color-secondary-bg-hover', colors.accent.secondary.backgroundHover)
    root.style.setProperty('--color-secondary-border', colors.accent.secondary.border)

    // Success colors
    root.style.setProperty('--color-success', colors.accent.success.primary)
    root.style.setProperty('--color-success-button', colors.accent.success.button)

    // Error colors
    root.style.setProperty('--color-error', colors.accent.error.primary)
    root.style.setProperty('--color-error-button', colors.accent.error.button)

    // Warning colors
    root.style.setProperty('--color-warning', colors.accent.warning.primary)
    root.style.setProperty('--color-warning-light', colors.accent.warning.light)
    root.style.setProperty('--color-warning-bg', colors.accent.warning.background)

    // Muted colors
    root.style.setProperty('--color-muted', colors.accent.muted.primary)
    root.style.setProperty('--color-muted-light', colors.accent.muted.light)

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
