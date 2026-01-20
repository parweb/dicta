/**
 * Theme Import/Export Utilities
 * Handle theme serialization and file operations
 */

import type { ThemeConfig } from '../theme-schema'
import { validateTheme } from '../theme-schema'

/**
 * Export theme as formatted JSON string
 */
export function exportTheme(theme: ThemeConfig): string {
  return JSON.stringify(theme, null, 2)
}

/**
 * Import theme from JSON string with validation
 */
export function importTheme(
  jsonString: string
): { success: true; theme: ThemeConfig } | { success: false; error: string } {
  try {
    const parsed = JSON.parse(jsonString)
    return validateTheme(parsed)
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { success: false, error: `Invalid JSON: ${error.message}` }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error parsing JSON'
    }
  }
}

/**
 * Download theme as JSON file
 */
export function downloadThemeFile(theme: ThemeConfig, filename = 'dicta-theme.json'): void {
  const json = exportTheme(theme)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up
  URL.revokeObjectURL(url)
}

/**
 * Read theme from uploaded file
 */
export function readThemeFile(
  file: File
): Promise<{ success: true; theme: ThemeConfig } | { success: false; error: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const result = importTheme(content)
        resolve(result)
      } catch (error) {
        resolve({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to read file'
        })
      }
    }

    reader.onerror = () => {
      resolve({ success: false, error: 'Failed to read file' })
    }

    reader.readAsText(file)
  })
}
