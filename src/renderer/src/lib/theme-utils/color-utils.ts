/**
 * Color Manipulation Utilities
 * Helper functions for color transformations
 */

/**
 * Convert hex color to RGB string
 */
export function hexToRgb(hex: string): string | null {
  // Remove # if present
  const cleanHex = hex.replace('#', '')

  if (cleanHex.length !== 6) return null

  const r = parseInt(cleanHex.substring(0, 2), 16)
  const g = parseInt(cleanHex.substring(2, 4), 16)
  const b = parseInt(cleanHex.substring(4, 6), 16)

  return `${r}, ${g}, ${b}`
}

/**
 * Add alpha channel to hex color
 */
export function addAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  return `rgba(${rgb}, ${alpha})`
}
