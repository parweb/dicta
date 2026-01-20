import type { ThemeConfig } from '../theme-schema'

/**
 * Midnight Ocean Theme - Deep marine depths
 * Dev: Coral accent | Prod: Teal accent
 */

const isDev = import.meta.env.DEV

export const midnightOceanTheme: ThemeConfig = {
  colors: {
    background: {
      primary: '#1A2332',
      secondary: '#243447',
      tertiary: '#2E4558',
      overlay: 'rgba(26, 35, 50, 0.95)'
    },
    text: {
      primary: '#E8F4F8',
      secondary: '#B8D4E0',
      tertiary: '#88B4CC',
      disabled: '#5A7C8F'
    },
    border: {
      primary: 'rgba(93, 173, 226, 0.2)',
      secondary: 'rgba(0, 206, 209, 0.15)',
      accent: isDev ? '#FF6B6B' : '#5DADE2'
    },
    accent: {
      primary: {
        primary: isDev ? '#FF6B6B' : '#00CED1',
        light: isDev ? '#FF8E8E' : '#5DADE2',
        dark: isDev ? '#E55555' : '#008B8B',
        background: isDev ? 'rgba(255, 107, 107, 0.1)' : 'rgba(0, 206, 209, 0.1)',
        backgroundHover: isDev
          ? 'rgba(255, 107, 107, 0.15)'
          : 'rgba(0, 206, 209, 0.15)',
        backgroundActive: isDev ? 'rgba(255, 107, 107, 0.2)' : 'rgba(0, 206, 209, 0.2)'
      },
      secondary: {
        primary: '#5DADE2',
        light: '#87CEEB',
        dark: '#2874A6',
        background: 'rgba(93, 173, 226, 0.1)',
        backgroundHover: 'rgba(93, 173, 226, 0.15)',
        border: 'rgba(93, 173, 226, 0.3)'
      },
      success: {
        primary: '#3EDBF0',
        button: '#00CED1'
      },
      error: {
        primary: '#FF6B9D',
        button: '#FF5177'
      },
      warning: {
        primary: '#FFB74D',
        light: '#FFD54F',
        background: 'rgba(255, 183, 77, 0.1)'
      },
      muted: {
        primary: '#78909C',
        light: '#90A4AE'
      }
    },
    state: {
      success: '#3EDBF0',
      error: '#FF6B9D',
      loading: '#5DADE2',
      cancelled: '#78909C',
      idle: '#5A7C8F'
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
