import type { ThemeConfig } from '../theme-schema'

/**
 * Deep Space Theme - Mysterious cosmos
 * Dev: Yellow accent | Prod: Purple accent
 */

const isDev = import.meta.env.DEV

export const deepSpaceTheme: ThemeConfig = {
  colors: {
    background: {
      primary: '#0A0E27',
      secondary: '#141937',
      tertiary: '#1E2447',
      overlay: 'rgba(10, 14, 39, 0.95)'
    },
    text: {
      primary: '#E8E6FF',
      secondary: '#C4C1E0',
      tertiary: '#9D99C7',
      disabled: '#6B6785'
    },
    border: {
      primary: 'rgba(106, 13, 173, 0.2)',
      secondary: 'rgba(65, 105, 225, 0.15)',
      accent: isDev ? '#FFEB3B' : '#6A0DAD'
    },
    accent: {
      primary: {
        primary: isDev ? '#FFEB3B' : '#6A0DAD',
        light: isDev ? '#FFF176' : '#8B3FBF',
        dark: isDev ? '#F9A825' : '#4A0072',
        background: isDev ? 'rgba(255, 235, 59, 0.1)' : 'rgba(106, 13, 173, 0.1)',
        backgroundHover: isDev ? 'rgba(255, 235, 59, 0.15)' : 'rgba(106, 13, 173, 0.15)',
        backgroundActive: isDev ? 'rgba(255, 235, 59, 0.2)' : 'rgba(106, 13, 173, 0.2)'
      },
      secondary: {
        primary: '#4169E1',
        light: '#6A8DFF',
        dark: '#2C4FB8',
        background: 'rgba(65, 105, 225, 0.1)',
        backgroundHover: 'rgba(65, 105, 225, 0.15)',
        border: 'rgba(65, 105, 225, 0.3)'
      },
      success: {
        primary: '#7C4DFF',
        button: '#651FFF'
      },
      error: {
        primary: '#EF5350',
        button: '#F44336'
      },
      warning: {
        primary: '#FFB300',
        light: '#FFC947',
        background: 'rgba(255, 179, 0, 0.1)'
      },
      muted: {
        primary: '#7E74A3',
        light: '#9F95C2'
      }
    },
    state: {
      success: '#7C4DFF',
      error: '#EF5350',
      loading: '#4169E1',
      cancelled: '#7E74A3',
      idle: '#5D5485'
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
