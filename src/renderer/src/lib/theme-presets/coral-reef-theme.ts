import type { ThemeConfig } from '../theme-schema'

/**
 * Coral Reef Theme - Vibrant coral colors
 * Dev: Pink accent | Prod: Coral accent
 */

const isDev = import.meta.env.DEV

export const coralReefTheme: ThemeConfig = {
  colors: {
    background: {
      primary: '#0D4C4A',
      secondary: '#176663',
      tertiary: '#21807C',
      overlay: 'rgba(13, 76, 74, 0.95)'
    },
    text: {
      primary: '#FFF8F0',
      secondary: '#FFE4D1',
      tertiary: '#FFCCB3',
      disabled: '#B89580'
    },
    border: {
      primary: 'rgba(255, 127, 80, 0.2)',
      secondary: 'rgba(64, 224, 208, 0.15)',
      accent: isDev ? '#FF1493' : '#FF7F50'
    },
    accent: {
      primary: {
        primary: isDev ? '#FF1493' : '#FF7F50',
        light: isDev ? '#FF69B4' : '#FF9A70',
        dark: isDev ? '#C71585' : '#E6673F',
        background: isDev ? 'rgba(255, 20, 147, 0.1)' : 'rgba(255, 127, 80, 0.1)',
        backgroundHover: isDev ? 'rgba(255, 20, 147, 0.15)' : 'rgba(255, 127, 80, 0.15)',
        backgroundActive: isDev ? 'rgba(255, 20, 147, 0.2)' : 'rgba(255, 127, 80, 0.2)'
      },
      secondary: {
        primary: '#40E0D0',
        light: '#7FFFD4',
        dark: '#20B2AA',
        background: 'rgba(64, 224, 208, 0.1)',
        backgroundHover: 'rgba(64, 224, 208, 0.15)',
        border: 'rgba(64, 224, 208, 0.3)'
      },
      success: {
        primary: '#26C6DA',
        button: '#00BCD4'
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
        primary: '#80CBC4',
        light: '#A7E1DB'
      }
    },
    state: {
      success: '#26C6DA',
      error: '#EF5350',
      loading: '#40E0D0',
      cancelled: '#80CBC4',
      idle: '#5FA39D'
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
