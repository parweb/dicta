/**
 * Theme Presets for Dicta
 *
 * Contains predefined themes: dark (current), light, and high contrast
 */

import { darkTheme } from './dark-theme'
import { lightTheme } from './light-theme'
import { highContrastTheme } from './high-contrast-theme'

// Re-export individual themes
export { darkTheme } from './dark-theme'
export { lightTheme } from './light-theme'
export { highContrastTheme } from './high-contrast-theme'

/**
 * Preset themes collection
 */
export const PRESET_THEMES = {
  dark: darkTheme,
  light: lightTheme,
  highContrast: highContrastTheme
} as const

/**
 * Preset theme metadata
 */
export const PRESET_METADATA = {
  dark: {
    name: 'Sombre',
    description: 'Thème par défaut avec fond sombre',
    icon: '🌙'
  },
  light: {
    name: 'Clair',
    description: 'Thème clair pour un usage diurne',
    icon: '☀️'
  },
  highContrast: {
    name: 'Contraste Élevé',
    description: 'Accessibilité maximale (WCAG AAA)',
    icon: '♿'
  }
} as const

export type PresetName = keyof typeof PRESET_THEMES
