import type { ThemeConfig } from '../theme-schema'

/**
 * Lavender Dream Theme - Soft pastel atmosphere
 * Dev: Orange accent | Prod: Lavender accent
 */

const isDev = import.meta.env.DEV

export const lavenderDreamTheme: ThemeConfig = {
  colors: {
    background: {
      primary: '#2C3E60',
      secondary: '#374A6F',
      tertiary: '#42567E',
      overlay: 'rgba(44, 62, 96, 0.95)'
    },
    text: {
      primary: '#F5F0FF',
      secondary: '#E8DAFF',
      tertiary: '#D4B8FF',
      disabled: '#9C8AB0'
    },
    border: {
      primary: 'rgba(177, 156, 217, 0.2)',
      secondary: 'rgba(255, 182, 193, 0.15)',
      accent: isDev ? '#FF7043' : '#B19CD9'
    },
    accent: {
      primary: {
        primary: isDev ? '#FF7043' : '#B19CD9',
        light: isDev ? '#FF8A65' : '#C9B3E8',
        dark: isDev ? '#E64A19' : '#9478B8',
        background: isDev ? 'rgba(255, 112, 67, 0.1)' : 'rgba(177, 156, 217, 0.1)',
        backgroundHover: isDev
          ? 'rgba(255, 112, 67, 0.15)'
          : 'rgba(177, 156, 217, 0.15)',
        backgroundActive: isDev ? 'rgba(255, 112, 67, 0.2)' : 'rgba(177, 156, 217, 0.2)'
      },
      secondary: {
        primary: '#FFB6C1',
        light: '#FFC9D4',
        dark: '#E69BAA',
        background: 'rgba(255, 182, 193, 0.1)',
        backgroundHover: 'rgba(255, 182, 193, 0.15)',
        border: 'rgba(255, 182, 193, 0.3)'
      },
      success: {
        primary: '#A78BFA',
        button: '#9333EA'
      },
      error: {
        primary: '#F472B6',
        button: '#EC4899'
      },
      warning: {
        primary: '#FBBF24',
        light: '#FCD34D',
        background: 'rgba(251, 191, 36, 0.1)'
      },
      muted: {
        primary: '#A294B8',
        light: '#BDB1D4'
      }
    },
    state: {
      success: '#A78BFA',
      error: '#F472B6',
      loading: '#B19CD9',
      cancelled: '#A294B8',
      idle: '#8B7FA0'
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
