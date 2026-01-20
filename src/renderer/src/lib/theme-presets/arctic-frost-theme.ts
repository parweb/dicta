import type { ThemeConfig } from '../theme-schema'

/**
 * Arctic Frost Theme - Icy Nordic atmosphere
 * Dev: Red accent | Prod: Frost blue accent
 */

const isDev = import.meta.env.DEV

export const arcticFrostTheme: ThemeConfig = {
  colors: {
    background: {
      primary: '#E3F2FD',
      secondary: '#BBDEFB',
      tertiary: '#90CAF9',
      overlay: 'rgba(227, 242, 253, 0.95)'
    },
    text: {
      primary: '#0D47A1',
      secondary: '#1565C0',
      tertiary: '#1976D2',
      disabled: '#64B5F6'
    },
    border: {
      primary: 'rgba(96, 125, 139, 0.2)',
      secondary: 'rgba(179, 229, 252, 0.3)',
      accent: isDev ? '#F44336' : '#607D8B'
    },
    accent: {
      primary: {
        primary: isDev ? '#F44336' : '#607D8B',
        light: isDev ? '#E57373' : '#78909C',
        dark: isDev ? '#C62828' : '#455A64',
        background: isDev ? 'rgba(244, 67, 54, 0.1)' : 'rgba(96, 125, 139, 0.1)',
        backgroundHover: isDev ? 'rgba(244, 67, 54, 0.15)' : 'rgba(96, 125, 139, 0.15)',
        backgroundActive: isDev ? 'rgba(244, 67, 54, 0.2)' : 'rgba(96, 125, 139, 0.2)'
      },
      secondary: {
        primary: '#B3E5FC',
        light: '#E1F5FE',
        dark: '#81D4FA',
        background: 'rgba(179, 229, 252, 0.3)',
        backgroundHover: 'rgba(179, 229, 252, 0.4)',
        border: 'rgba(179, 229, 252, 0.5)'
      },
      success: {
        primary: '#29B6F6',
        button: '#03A9F4'
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
        primary: '#90A4AE',
        light: '#B0BEC5'
      }
    },
    state: {
      success: '#29B6F6',
      error: '#EF5350',
      loading: '#607D8B',
      cancelled: '#90A4AE',
      idle: '#B0BEC5'
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
