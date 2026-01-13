/**
 * Design System - Dicta
 *
 * Centralized color palette and design tokens for consistent UI
 */

// =============================================================================
// ENVIRONMENT-AWARE ACCENT COLOR
// =============================================================================

// In dev mode, use bright red accent to differentiate from production
const isDev = import.meta.env.DEV;

const accentColor = {
  primary: isDev ? '#ef4444' : '#0ea5e9', // Red in dev, blue in prod
  light: isDev ? '#f87171' : '#38bdf8',
  dark: isDev ? '#7f1d1d' : '#0c4a6e',
  rgb: isDev ? '239, 68, 68' : '14, 165, 233'
};

// =============================================================================
// COLORS
// =============================================================================

export const colors = {
  // Background colors
  background: {
    primary: '#0f172a', // Main app background (slate-950)
    secondary: '#1e293b', // Cards, surfaces (slate-800)
    tertiary: '#334155', // Elevated surfaces (slate-700)
    overlay: 'rgba(0, 0, 0, 0.5)' // Modal/sidebar overlay
  },

  // Text colors
  text: {
    primary: '#f9fafb', // Main text (gray-50)
    secondary: '#e5e7eb', // Secondary text (gray-200)
    tertiary: '#94a3b8', // Muted text (slate-400)
    disabled: '#64748b' // Disabled state (slate-500)
  },

  // Border colors
  border: {
    primary: '#334155', // Main borders (slate-700)
    secondary: '#475569', // Hover borders (slate-600)
    accent: accentColor.primary // Environment-aware accent border
  },

  // Accent colors
  accent: {
    blue: {
      primary: accentColor.primary, // Environment-aware primary
      light: accentColor.light, // Environment-aware light
      dark: accentColor.dark, // Environment-aware dark
      background: `rgba(${accentColor.rgb}, 0.1)`, // Tint background
      backgroundHover: `rgba(${accentColor.rgb}, 0.15)`,
      backgroundActive: `rgba(${accentColor.rgb}, 0.2)`
    },
    green: {
      primary: '#4ade80', // Success green (green-400)
      button: '#4CAF50' // Record button green
    },
    red: {
      primary: '#ef4444', // Error red (red-500)
      button: '#ff4444' // Recording button red
    },
    yellow: {
      primary: '#eab308', // Warning yellow (yellow-500)
      light: '#fef08a', // Light yellow text (yellow-200)
      background: 'rgba(234, 179, 8, 0.1)' // Yellow tint background
    },
    gray: {
      primary: '#9ca3af', // Neutral gray (gray-400)
      light: '#d1d5db' // Light gray (gray-300)
    }
  },

  // State colors (for proxy indicators, etc.)
  state: {
    success: '#4ade80',
    error: '#ef4444',
    loading: '#ffffff',
    cancelled: '#9ca3af',
    idle: '#d1d5db'
  }
} as const;

// =============================================================================
// SPACING
// =============================================================================

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '40px'
} as const;

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const typography = {
  fontSize: {
    xs: '10px',
    sm: '11px',
    base: '14px',
    lg: '18px',
    xl: '24px',
    '2xl': '32px'
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  lineHeight: {
    tight: '1.2',
    normal: '1.4',
    relaxed: '1.6',
    loose: '1.8'
  },
  letterSpacing: {
    tight: '-0.5px',
    normal: '0px',
    wide: '0.5px',
    wider: '1px'
  }
} as const;

// =============================================================================
// BORDER RADIUS
// =============================================================================

export const borderRadius = {
  xs: '1px',
  sm: '5px',
  md: '6px',
  lg: '8px',
  full: '50%'
} as const;

// =============================================================================
// BORDERS
// =============================================================================

export const borders = {
  light: '1px solid rgba(255, 255, 255, 0.1)',
  medium: '1px solid rgba(255, 255, 255, 0.3)',
  primary: `1px solid ${colors.border.primary}`,
  secondary: `1px solid ${colors.border.secondary}`,
  accent: `1px solid ${colors.border.accent}`
} as const;

// =============================================================================
// SHADOWS
// =============================================================================

export const shadows = {
  sm: '0 1px 3px rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px rgba(0, 0, 0, 0.3)',
  lg: '2px 0 8px rgba(0, 0, 0, 0.5)',
  inner: 'inset 0 0 2px rgba(0, 0, 0, 0.3)'
} as const;

// =============================================================================
// CHARTS
// =============================================================================

export const charts = {
  bar: {
    fill: accentColor.primary, // Environment-aware chart color
    rgb: accentColor.rgb // RGB values for dynamic opacity
  },
  brush: {
    stroke: `rgba(${accentColor.rgb}, 0.6)`, // Environment-aware with opacity
    fill: `rgba(${accentColor.rgb}, 0.08)` // Environment-aware with low opacity
  }
};

// =============================================================================
// COMPONENT STYLES
// =============================================================================

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
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get status color for proxy indicators
 */
export function getStatusColor(
  status: 'idle' | 'loading' | 'success' | 'error' | 'cancelled'
): string {
  return colors.state[status];
}

/**
 * Get recording button color based on state
 */
export function getRecordButtonColor(
  isRecording: boolean,
  isLoading: boolean
): string {
  if (isRecording) return colors.accent.red.button;
  if (isLoading) return colors.accent.gray.primary;
  return colors.accent.green.button;
}

/**
 * Create consistent style objects for common patterns
 */
export const styleHelpers = {
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
};
