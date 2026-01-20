import type { ThemeConfig } from '../theme-schema'

/**
 * Forest Canopy Theme - Lush forest atmosphere
 * Dev: Amber accent | Prod: Emerald accent
 */

const isDev = import.meta.env.DEV

export const forestCanopyTheme: ThemeConfig = {
  colors: {
    background: {
      primary: '#1B3A2F',
      secondary: '#254838',
      tertiary: '#2F5641',
      overlay: 'rgba(27, 58, 47, 0.95)'
    },
    text: {
      primary: '#E8F5E9',
      secondary: '#C8E6C9',
      tertiary: '#A5D6A7',
      disabled: '#7A9F7E'
    },
    border: {
      primary: 'rgba(80, 200, 120, 0.2)',
      secondary: 'rgba(154, 205, 50, 0.15)',
      accent: isDev ? '#FFA500' : '#50C878'
    },
    accent: {
      primary: {
        primary: isDev ? '#FFA500' : '#50C878',
        light: isDev ? '#FFB733' : '#6FD99A',
        dark: isDev ? '#CC8400' : '#3FA060',
        background: isDev ? 'rgba(255, 165, 0, 0.1)' : 'rgba(80, 200, 120, 0.1)',
        backgroundHover: isDev ? 'rgba(255, 165, 0, 0.15)' : 'rgba(80, 200, 120, 0.15)',
        backgroundActive: isDev ? 'rgba(255, 165, 0, 0.2)' : 'rgba(80, 200, 120, 0.2)'
      },
      secondary: {
        primary: '#9ACD32',
        light: '#B4E051',
        dark: '#7BA428',
        background: 'rgba(154, 205, 50, 0.1)',
        backgroundHover: 'rgba(154, 205, 50, 0.15)',
        border: 'rgba(154, 205, 50, 0.3)'
      },
      success: {
        primary: '#66BB6A',
        button: '#4CAF50'
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
        primary: '#81A684',
        light: '#A0C5A3'
      }
    },
    state: {
      success: '#66BB6A',
      error: '#EF5350',
      loading: '#50C878',
      cancelled: '#81A684',
      idle: '#648567'
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
