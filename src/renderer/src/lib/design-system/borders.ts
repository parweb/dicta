/**
 * Design System - Borders and Shadows
 * Border radius, border styles, and shadow definitions
 */

import { colors } from './colors'

// =============================================================================
// BORDER RADIUS
// =============================================================================

export const borderRadius = {
  xs: '1px',
  sm: '5px',
  md: '6px',
  lg: '8px',
  full: '50%'
} as const

// =============================================================================
// BORDERS
// =============================================================================

export const borders = {
  light: '1px solid rgba(255, 255, 255, 0.1)',
  medium: '1px solid rgba(255, 255, 255, 0.3)',
  primary: `1px solid ${colors.border.primary}`,
  secondary: `1px solid ${colors.border.secondary}`,
  accent: `1px solid ${colors.border.accent}`
} as const

// =============================================================================
// SHADOWS
// =============================================================================

export const shadows = {
  sm: '0 1px 3px rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px rgba(0, 0, 0, 0.3)',
  lg: '2px 0 8px rgba(0, 0, 0, 0.5)',
  inner: 'inset 0 0 2px rgba(0, 0, 0, 0.3)'
} as const
