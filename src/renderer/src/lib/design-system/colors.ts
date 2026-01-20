/**
 * Design System - Colors
 * All color definitions including environment-aware accent colors
 */

// =============================================================================
// ENVIRONMENT-AWARE ACCENT COLOR
// =============================================================================

// In dev mode, use bright red accent to differentiate from production
const isDev = import.meta.env.DEV

console.log('[DESIGN-SYSTEM] import.meta.env.DEV:', isDev)
console.log('[DESIGN-SYSTEM] import.meta.env.MODE:', import.meta.env.MODE)

export const accentColor = {
  primary: isDev ? '#ef4444' : '#0ea5e9', // Red in dev, blue in prod
  light: isDev ? '#f87171' : '#38bdf8',
  dark: isDev ? '#7f1d1d' : '#0c4a6e',
  rgb: isDev ? '239, 68, 68' : '14, 165, 233'
}

console.log('[DESIGN-SYSTEM] accentColor.primary:', accentColor.primary)

// =============================================================================
// COLORS
// =============================================================================

export const colors = {
  // Background colors
  background: {
    primary: '#0f172a', // Main app background (slate-950)
    secondary: '#1e293b', // Cards, surfaces (slate-800)
    tertiary: '#334155', // Elevated surfaces (slate-700)
    overlay: 'rgba(0, 0, 0, 0.5)' // Modal/sidebar overlay
  },

  // Text colors
  text: {
    primary: '#f9fafb', // Main text (gray-50)
    secondary: '#e5e7eb', // Secondary text (gray-200)
    tertiary: '#94a3b8', // Muted text (slate-400)
    disabled: '#64748b' // Disabled state (slate-500)
  },

  // Border colors
  border: {
    primary: '#334155', // Main borders (slate-700)
    secondary: '#475569', // Hover borders (slate-600)
    accent: accentColor.primary // Environment-aware accent border
  },

  // Accent colors
  accent: {
    blue: {
      primary: accentColor.primary, // Environment-aware primary
      light: accentColor.light, // Environment-aware light
      dark: accentColor.dark, // Environment-aware dark
      background: `rgba(${accentColor.rgb}, 0.1)`, // Tint background
      backgroundHover: `rgba(${accentColor.rgb}, 0.15)`,
      backgroundActive: `rgba(${accentColor.rgb}, 0.2)`
    },
    purple: {
      primary: '#a78bfa', // Purple for AI/Bedrock actions (violet-400)
      light: '#c4b5fd', // Light purple (violet-300)
      dark: '#7c3aed', // Dark purple (violet-600)
      background: 'rgba(139, 92, 246, 0.1)', // Purple tint background
      backgroundHover: 'rgba(139, 92, 246, 0.15)',
      border: 'rgba(139, 92, 246, 0.3)' // Purple border
    },
    green: {
      primary: '#4ade80', // Success green (green-400)
      button: '#4CAF50' // Record button green
    },
    red: {
      primary: '#ef4444', // Error red (red-500)
      button: '#ff4444' // Recording button red
    },
    yellow: {
      primary: '#eab308', // Warning yellow (yellow-500)
      light: '#fef08a', // Light yellow text (yellow-200)
      background: 'rgba(234, 179, 8, 0.1)' // Yellow tint background
    },
    gray: {
      primary: '#9ca3af', // Neutral gray (gray-400)
      light: '#d1d5db' // Light gray (gray-300)
    }
  },

  // State colors (for proxy indicators, etc.)
  state: {
    success: '#4ade80',
    error: '#ef4444',
    loading: '#ffffff',
    cancelled: '#9ca3af',
    idle: '#d1d5db'
  }
} as const
