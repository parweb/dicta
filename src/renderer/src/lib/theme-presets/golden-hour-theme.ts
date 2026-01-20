import type { ThemeConfig } from '../theme-schema'

/**
 * Golden Hour Theme - Warm golden light
 * Dev: Cyan accent | Prod: Gold accent
 */

const isDev = import.meta.env.DEV

export const goldenHourTheme: ThemeConfig = {
  colors: {
    background: {
      primary: '#3E2723',
      secondary: '#4E342E',
      tertiary: '#5D4037',
      overlay: 'rgba(62, 39, 35, 0.95)'
    },
    text: {
      primary: '#FFF8E1',
      secondary: '#FFECB3',
      tertiary: '#FFE082',
      disabled: '#C7A57B'
    },
    border: {
      primary: 'rgba(255, 179, 0, 0.2)',
      secondary: 'rgba(255, 204, 188, 0.15)',
      accent: isDev ? '#00BCD4' : '#FFB300'
    },
    accent: {
      primary: {
        primary: isDev ? '#00BCD4' : '#FFB300',
        light: isDev ? '#26C6DA' : '#FFC947',
        dark: isDev ? '#0097A7' : '#CC8F00',
        background: isDev ? 'rgba(0, 188, 212, 0.1)' : 'rgba(255, 179, 0, 0.1)',
        backgroundHover: isDev ? 'rgba(0, 188, 212, 0.15)' : 'rgba(255, 179, 0, 0.15)',
        backgroundActive: isDev ? 'rgba(0, 188, 212, 0.2)' : 'rgba(255, 179, 0, 0.2)'
      },
      secondary: {
        primary: '#FFCCBC',
        light: '#FFE0B2',
        dark: '#FFB299',
        background: 'rgba(255, 204, 188, 0.1)',
        backgroundHover: 'rgba(255, 204, 188, 0.15)',
        border: 'rgba(255, 204, 188, 0.3)'
      },
      success: {
        primary: '#FFB74D',
        button: '#FF9800'
      },
      error: {
        primary: '#EF5350',
        button: '#F44336'
      },
      warning: {
        primary: '#FFA726',
        light: '#FFB74D',
        background: 'rgba(255, 167, 38, 0.1)'
      },
      muted: {
        primary: '#BCAAA4',
        light: '#D7CCC8'
      }
    },
    state: {
      success: '#FFB74D',
      error: '#EF5350',
      loading: '#FFB300',
      cancelled: '#BCAAA4',
      idle: '#A1887F'
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
