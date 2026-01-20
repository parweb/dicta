/**
 * Design System - Components
 * Reusable style objects for common components
 */

import { colors } from './colors'
import { spacing } from './spacing'
import { typography } from './typography'
import { borderRadius } from './borders'
import { shadows } from './borders'

export const components = {
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
      padding: spacing.sm,
      backgroundColor: 'transparent'
    },
    record: {
      padding: '15px 30px',
      fontSize: typography.fontSize.lg,
      color: colors.text.primary,
      border: 'none',
      borderRadius: borderRadius.sm,
      transition: 'background-color 0.3s'
    }
  },

  card: {
    base: {
      backgroundColor: colors.background.secondary,
      borderRadius: borderRadius.lg,
      border: `1px solid ${colors.border.primary}`,
      padding: spacing.xl
    },
    hover: {
      backgroundColor: colors.background.primary,
      borderColor: colors.border.secondary
    }
  },

  sidebar: {
    base: {
      backgroundColor: colors.background.secondary,
      boxShadow: shadows.lg,
      borderRight: `1px solid ${colors.border.primary}`
    }
  },

  input: {
    base: {
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
      borderRadius: borderRadius.sm,
      padding: spacing.md,
      color: colors.text.secondary
    }
  },

  proxyIndicator: {
    container: {
      padding: '3px 6px',
      color: colors.text.secondary,
      backgroundColor: 'rgba(30, 41, 59, 0.8)',
      backdropFilter: 'blur(4px)',
      borderRadius: borderRadius.md,
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: shadows.sm
    },
    dot: {
      width: '6px',
      height: '6px',
      borderRadius: borderRadius.full
    }
  }
} as const
