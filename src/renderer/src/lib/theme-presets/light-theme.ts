import type { ThemeConfig } from '../theme-schema'

/**
 * Light Theme - Inverted color scheme for daytime use
 */

export const lightTheme: ThemeConfig = {
  colors: {
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
      overlay: 'rgba(0, 0, 0, 0.3)'
    },
    text: {
      primary: '#0f172a',
      secondary: '#334155',
      tertiary: '#64748b',
      disabled: '#94a3b8'
    },
    border: {
      primary: '#e2e8f0',
      secondary: '#cbd5e1',
      accent: '#0ea5e9'
    },
    accent: {
      blue: {
        primary: '#0ea5e9',
        light: '#38bdf8',
        dark: '#0369a1',
        background: 'rgba(14, 165, 233, 0.08)',
        backgroundHover: 'rgba(14, 165, 233, 0.12)',
        backgroundActive: 'rgba(14, 165, 233, 0.16)'
      },
      purple: {
        primary: '#8b5cf6',
        light: '#a78bfa',
        dark: '#6d28d9',
        background: 'rgba(139, 92, 246, 0.08)',
        backgroundHover: 'rgba(139, 92, 246, 0.12)',
        border: 'rgba(139, 92, 246, 0.25)'
      },
      green: {
        primary: '#22c55e',
        button: '#16a34a'
      },
      red: {
        primary: '#ef4444',
        button: '#dc2626'
      },
      yellow: {
        primary: '#eab308',
        light: '#fde047',
        background: 'rgba(234, 179, 8, 0.08)'
      },
      gray: {
        primary: '#6b7280',
        light: '#9ca3af'
      }
    },
    state: {
      success: '#22c55e',
      error: '#ef4444',
      loading: '#0f172a',
      cancelled: '#6b7280',
      idle: '#9ca3af'
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '40px'
  },
  typography: {
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
      tight: '0px',
      normal: '0px',
      wide: '0px',
      wider: '1px'
    }
  },
  borderRadius: {
    xs: '1px',
    sm: '5px',
    md: '6px',
    lg: '8px',
    full: '50%'
  }
}
