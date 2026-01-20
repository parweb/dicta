import type { ThemeConfig } from '../theme-schema'

/**
 * High Contrast Theme - WCAG AAA compliant for accessibility
 */

export const highContrastTheme: ThemeConfig = {
  colors: {
    background: {
      primary: '#000000',
      secondary: '#1a1a1a',
      tertiary: '#2d2d2d',
      overlay: 'rgba(0, 0, 0, 0.8)'
    },
    text: {
      primary: '#ffffff',
      secondary: '#ffffff',
      tertiary: '#e0e0e0',
      disabled: '#808080'
    },
    border: {
      primary: '#ffffff',
      secondary: '#cccccc',
      accent: '#00d4ff'
    },
    accent: {
      primary: {
        primary: '#00d4ff',
        light: '#66e4ff',
        dark: '#0088cc',
        background: 'rgba(0, 212, 255, 0.15)',
        backgroundHover: 'rgba(0, 212, 255, 0.25)',
        backgroundActive: 'rgba(0, 212, 255, 0.35)'
      },
      secondary: {
        primary: '#cc99ff',
        light: '#e6ccff',
        dark: '#9966ff',
        background: 'rgba(204, 153, 255, 0.15)',
        backgroundHover: 'rgba(204, 153, 255, 0.25)',
        border: 'rgba(204, 153, 255, 0.4)'
      },
      success: {
        primary: '#00ff00',
        button: '#00cc00'
      },
      error: {
        primary: '#ff0000',
        button: '#cc0000'
      },
      warning: {
        primary: '#ffff00',
        light: '#ffff99',
        background: 'rgba(255, 255, 0, 0.15)'
      },
      muted: {
        primary: '#cccccc',
        light: '#e0e0e0'
      }
    },
    state: {
      success: '#00ff00',
      error: '#ff0000',
      loading: '#ffffff',
      cancelled: '#cccccc',
      idle: '#808080'
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
      xs: '11px',
      sm: '13px',
      base: '16px',
      lg: '20px',
      xl: '26px',
      '2xl': '34px'
    },
    fontWeight: {
      normal: 400,
      medium: 600,
      semibold: 700,
      bold: 800
    },
    lineHeight: {
      tight: '1.3',
      normal: '1.5',
      relaxed: '1.7',
      loose: '2.0'
    },
    letterSpacing: {
      tight: '0px',
      normal: '0px',
      wide: '1px',
      wider: '2px'
    }
  },
  borderRadius: {
    xs: '2px',
    sm: '4px',
    md: '6px',
    lg: '8px',
    full: '50%'
  }
}
