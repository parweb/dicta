/**
 * Theme Presets for Dicta
 *
 * Contains predefined themes: dark (current), light, high contrast,
 * and 8 original themes with dev/prod variants
 */

import { darkTheme } from './dark-theme'
import { lightTheme } from './light-theme'
import { highContrastTheme } from './high-contrast-theme'
import { midnightOceanTheme } from './midnight-ocean-theme'
import { sunsetAmberTheme } from './sunset-amber-theme'
import { forestCanopyTheme } from './forest-canopy-theme'
import { lavenderDreamTheme } from './lavender-dream-theme'
import { coralReefTheme } from './coral-reef-theme'
import { arcticFrostTheme } from './arctic-frost-theme'
import { goldenHourTheme } from './golden-hour-theme'
import { deepSpaceTheme } from './deep-space-theme'

// Re-export individual themes
export { darkTheme } from './dark-theme'
export { lightTheme } from './light-theme'
export { highContrastTheme } from './high-contrast-theme'
export { midnightOceanTheme } from './midnight-ocean-theme'
export { sunsetAmberTheme } from './sunset-amber-theme'
export { forestCanopyTheme } from './forest-canopy-theme'
export { lavenderDreamTheme } from './lavender-dream-theme'
export { coralReefTheme } from './coral-reef-theme'
export { arcticFrostTheme } from './arctic-frost-theme'
export { goldenHourTheme } from './golden-hour-theme'
export { deepSpaceTheme } from './deep-space-theme'

/**
 * Preset themes collection
 */
export const PRESET_THEMES = {
  // Classic themes
  dark: darkTheme,
  light: lightTheme,
  highContrast: highContrastTheme,

  // Original themes with dev/prod variants
  midnightOcean: midnightOceanTheme,
  sunsetAmber: sunsetAmberTheme,
  forestCanopy: forestCanopyTheme,
  lavenderDream: lavenderDreamTheme,
  coralReef: coralReefTheme,
  arcticFrost: arcticFrostTheme,
  goldenHour: goldenHourTheme,
  deepSpace: deepSpaceTheme
} as const

/**
 * Preset theme metadata
 */
export const PRESET_METADATA = {
  // Classic themes
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
  },

  // Original themes
  midnightOcean: {
    name: 'Midnight Ocean',
    description: 'Profondeurs marines mystérieuses',
    icon: '🌊'
  },
  sunsetAmber: {
    name: 'Sunset Amber',
    description: 'Crépuscule chaleureux',
    icon: '🌅'
  },
  forestCanopy: {
    name: 'Forest Canopy',
    description: 'Forêt luxuriante et vivante',
    icon: '🌲'
  },
  lavenderDream: {
    name: 'Lavender Dream',
    description: 'Douceur pastel apaisante',
    icon: '💜'
  },
  coralReef: {
    name: 'Coral Reef',
    description: 'Récif corallien coloré',
    icon: '🐠'
  },
  arcticFrost: {
    name: 'Arctic Frost',
    description: 'Glace nordique cristalline',
    icon: '❄️'
  },
  goldenHour: {
    name: 'Golden Hour',
    description: 'Lumière dorée magique',
    icon: '✨'
  },
  deepSpace: {
    name: 'Deep Space',
    description: 'Cosmos infini et mystérieux',
    icon: '🌌'
  }
} as const

export type PresetName = keyof typeof PRESET_THEMES
