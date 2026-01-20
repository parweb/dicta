/**
 * Design System - Charts
 * Chart-specific color and style configurations
 */

import { accentColor } from './colors'

export const charts = {
  bar: {
    fill: accentColor.primary, // Environment-aware chart color
    rgb: accentColor.rgb // RGB values for dynamic opacity
  },
  brush: {
    stroke: `rgba(${accentColor.rgb}, 0.6)`, // Environment-aware with opacity
    fill: `rgba(${accentColor.rgb}, 0.08)` // Environment-aware with low opacity
  }
}
