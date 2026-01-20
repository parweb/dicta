/**
 * Theme Merge Utilities
 * Deep merge for theme updates
 */

import type { ThemeConfig, PartialThemeConfig } from '../theme-schema'

/**
 * Deep merge utility for theme updates
 * Merges partial theme updates into a base theme
 */
export function mergeTheme(base: ThemeConfig, updates: PartialThemeConfig): ThemeConfig {
  const result = { ...base }

  // Helper to recursively merge objects
  function deepMerge(target: any, source: any): any {
    if (!source) return target

    const output = { ...target }

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        output[key] = deepMerge(target[key] || {}, source[key])
      } else if (source[key] !== undefined) {
        output[key] = source[key]
      }
    }

    return output
  }

  return deepMerge(result, updates)
}
