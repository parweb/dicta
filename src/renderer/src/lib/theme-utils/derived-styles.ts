/**
 * Derived Styles Calculator
 * Compute dynamic style properties from base theme tokens
 */

import type { ThemeConfig } from '../theme-schema'
import { hexToRgb, addAlpha } from './color-utils'

/**
 * Compute derived style properties from theme
 * These are dynamic values calculated from base theme tokens
 */
export function computeDerivedStyles(theme: ThemeConfig) {
  return {
    borders: {
      light: '1px solid rgba(255, 255, 255, 0.1)',
      medium: '1px solid rgba(255, 255, 255, 0.3)',
      primary: `1px solid ${theme.colors.border.primary}`,
      secondary: `1px solid ${theme.colors.border.secondary}`,
      accent: `1px solid ${theme.colors.border.accent}`
    },
    shadows: {
      sm: '0 1px 3px rgba(0, 0, 0, 0.3)',
      md: '0 4px 6px rgba(0, 0, 0, 0.3)',
      lg: '2px 0 8px rgba(0, 0, 0, 0.5)',
      inner: 'inset 0 0 2px rgba(0, 0, 0, 0.3)'
    },
    charts: {
      bar: {
        fill: theme.colors.accent.primary.primary,
        rgb: hexToRgb(theme.colors.accent.primary.primary) || '59, 130, 246'
      },
      brush: {
        stroke: addAlpha(theme.colors.accent.primary.primary, 0.6),
        fill: addAlpha(theme.colors.accent.primary.primary, 0.08)
      }
    },
    components: {
      button: {
        base: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s'
        },
        icon: {
          padding: theme.spacing.sm,
          backgroundColor: 'transparent'
        },
        record: {
          padding: '15px 30px',
          fontSize: theme.typography.fontSize.lg,
          color: theme.colors.text.primary,
          border: 'none',
          borderRadius: theme.borderRadius.sm,
          transition: 'background-color 0.3s'
        }
      },
      card: {
        base: {
          backgroundColor: theme.colors.background.secondary,
          borderRadius: theme.borderRadius.lg,
          border: `1px solid ${theme.colors.border.primary}`,
          padding: theme.spacing.xl
        },
        hover: {
          backgroundColor: theme.colors.background.primary,
          borderColor: theme.colors.border.secondary
        }
      },
      sidebar: {
        base: {
          backgroundColor: theme.colors.background.secondary,
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.5)',
          borderRight: `1px solid ${theme.colors.border.primary}`
        }
      },
      input: {
        base: {
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          borderRadius: theme.borderRadius.sm,
          padding: theme.spacing.md,
          color: theme.colors.text.secondary
        }
      },
      proxyIndicator: {
        container: {
          padding: '3px 6px',
          color: theme.colors.text.secondary,
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(4px)',
          borderRadius: theme.borderRadius.md,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
        },
        dot: {
          width: '6px',
          height: '6px',
          borderRadius: theme.borderRadius.full
        }
      }
    },
    styleHelpers: {
      flexCenter: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      flexColumn: {
        display: 'flex',
        flexDirection: 'column' as const
      },
      absolute: {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }
    }
  }
}
