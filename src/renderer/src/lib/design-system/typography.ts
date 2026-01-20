/**
 * Design System - Typography
 * Font sizes, weights, line heights, and letter spacing
 */

export const typography = {
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
    tight: '-0.5px',
    normal: '0px',
    wide: '0.5px',
    wider: '1px'
  }
} as const
