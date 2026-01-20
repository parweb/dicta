/**
 * Status Color Helpers
 * Helper functions for status-based colors
 */

import type { ThemeConfig } from '../theme-schema'

/**
 * Get status color for proxy indicators
 */
export function getStatusColor(
  status: 'idle' | 'loading' | 'success' | 'error' | 'cancelled',
  theme: ThemeConfig
): string {
  return theme.colors.state[status]
}

/**
 * Get recording button color based on state
 */
export function getRecordButtonColor(
  isRecording: boolean,
  isLoading: boolean,
  theme: ThemeConfig
): string {
  if (isRecording) return theme.colors.accent.error.button
  if (isLoading) return theme.colors.accent.muted.primary
  return theme.colors.accent.success.button
}
