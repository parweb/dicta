import type { ThemeConfig } from '../theme-schema'

/**
 * Sunset Amber Theme - Warm twilight colors
 * Dev: Magenta accent | Prod: Orange accent
 */

const isDev = import.meta.env.DEV

export const sunsetAmberTheme: ThemeConfig = {
  colors: {
    background: {
      primary: '#2D1B3D',
      secondary: '#3D2650',
      tertiary: '#4D3163',
      overlay: 'rgba(45, 27, 61, 0.95)'
    },
    text: {
      primary: '#FFF4E6',
      secondary: '#FFE0B2',
      tertiary: '#FFCC80',
      disabled: '#B8956A'
    },
    border: {
      primary: 'rgba(255, 140, 66, 0.2)',
      secondary: 'rgba(255, 209, 102, 0.15)',
      accent: isDev ? '#E91E63' : '#FF8C42'
    },
    accent: {
      primary: {
        primary: isDev ? '#E91E63' : '#FF8C42',
        light: isDev ? '#F06292' : '#FFAA66',
        dark: isDev ? '#AD1457' : '#CC6F35',
        background: isDev ? 'rgba(233, 30, 99, 0.1)' : 'rgba(255, 140, 66, 0.1)',
        backgroundHover: isDev ? 'rgba(233, 30, 99, 0.15)' : 'rgba(255, 140, 66, 0.15)',
        backgroundActive: isDev ? 'rgba(233, 30, 99, 0.2)' : 'rgba(255, 140, 66, 0.2)'
      },
      secondary: {
        primary: '#FFD166',
        light: '#FFE194',
        dark: '#E6BC5E',
        background: 'rgba(255, 209, 102, 0.1)',
        backgroundHover: 'rgba(255, 209, 102, 0.15)',
        border: 'rgba(255, 209, 102, 0.3)'
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
        primary: '#B8956A',
        light: '#D4B896'
      }
    },
    state: {
      success: '#FFB74D',
      error: '#EF5350',
      loading: '#FF8C42',
      cancelled: '#B8956A',
      idle: '#8C7766'
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
