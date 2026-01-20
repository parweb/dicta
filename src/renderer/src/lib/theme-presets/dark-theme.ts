import type { ThemeConfig } from '../theme-schema'

/**
 * Dark Theme - Current design system (default)
 * Environment-aware: shows red accent in dev mode
 */

// In dev mode, use bright red background to differentiate from production
const isDev = import.meta.env.DEV

console.log('[DARK-THEME] Environment:', import.meta.env.MODE)
console.log('[DARK-THEME] isDev:', isDev)

export const darkTheme: ThemeConfig = {
  colors: {
    background: {
      primary: isDev ? '#2d0a0a' : '#0f172a', // Dark red in dev, slate in prod
      secondary: isDev ? '#3d1515' : '#1e293b',
      tertiary: isDev ? '#4d2020' : '#334155',
      overlay: 'rgba(0, 0, 0, 0.5)'
    },
    text: {
      primary: '#f9fafb',
      secondary: '#e5e7eb',
      tertiary: '#94a3b8',
      disabled: '#64748b'
    },
    border: {
      primary: isDev ? '#5d3030' : '#334155',
      secondary: isDev ? '#6d4040' : '#475569',
      accent: isDev ? '#ef4444' : '#0ea5e9'
    },
    accent: {
      blue: {
        primary: isDev ? '#ef4444' : '#0ea5e9',
        light: isDev ? '#f87171' : '#38bdf8',
        dark: isDev ? '#7f1d1d' : '#0c4a6e',
        background: isDev ? 'rgba(239, 68, 68, 0.1)' : 'rgba(14, 165, 233, 0.1)',
        backgroundHover: isDev ? 'rgba(239, 68, 68, 0.15)' : 'rgba(14, 165, 233, 0.15)',
        backgroundActive: isDev ? 'rgba(239, 68, 68, 0.2)' : 'rgba(14, 165, 233, 0.2)'
      },
      green: {
        primary: '#4ade80',
        button: '#4CAF50'
      },
      red: {
        primary: '#ef4444',
        button: '#ff4444'
      },
      yellow: {
        primary: '#eab308',
        light: '#fef08a',
        background: 'rgba(234, 179, 8, 0.1)'
      },
      gray: {
        primary: '#9ca3af',
        light: '#d1d5db'
      }
    },
    state: {
      success: '#4ade80',
      error: '#ef4444',
      loading: '#ffffff',
      cancelled: '#9ca3af',
      idle: '#d1d5db'
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
