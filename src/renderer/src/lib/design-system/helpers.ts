/**
 * Design System - Helpers
 * Helper functions and style utility objects
 */

import { colors } from './colors'

/**
 * Get status color for proxy indicators
 */
export function getStatusColor(
  status: 'idle' | 'loading' | 'success' | 'error' | 'cancelled'
): string {
  return colors.state[status]
}

/**
 * Get recording button color based on state
 */
export function getRecordButtonColor(isRecording: boolean, isLoading: boolean): string {
  if (isRecording) return colors.accent.error.button
  if (isLoading) return colors.accent.muted.primary
  return colors.accent.success.button
}

/**
 * Create consistent style objects for common patterns
 */
export const styleHelpers = {
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  flexColumn: {
    display: 'flex',
    flexDirection: 'column' as const
  },
  absolute: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
}
