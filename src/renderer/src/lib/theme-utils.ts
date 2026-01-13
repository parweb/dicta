import type { ThemeConfig, PartialThemeConfig } from './theme-schema';
import { validateTheme } from './theme-schema';

/**
 * Deep merge utility for theme updates
 * Merges partial theme updates into a base theme
 */
export function mergeTheme(
  base: ThemeConfig,
  updates: PartialThemeConfig
): ThemeConfig {
  const result = { ...base };

  // Helper to recursively merge objects
  function deepMerge(target: any, source: any): any {
    if (!source) return target;

    const output = { ...target };

    for (const key in source) {
      if (
        source[key] &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key])
      ) {
        output[key] = deepMerge(target[key] || {}, source[key]);
      } else if (source[key] !== undefined) {
        output[key] = source[key];
      }
    }

    return output;
  }

  return deepMerge(result, updates);
}

/**
 * Export theme as formatted JSON string
 */
export function exportTheme(theme: ThemeConfig): string {
  return JSON.stringify(theme, null, 2);
}

/**
 * Import theme from JSON string with validation
 */
export function importTheme(
  jsonString: string
): { success: true; theme: ThemeConfig } | { success: false; error: string } {
  try {
    const parsed = JSON.parse(jsonString);
    return validateTheme(parsed);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { success: false, error: `Invalid JSON: ${error.message}` };
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Unknown error parsing JSON'
    };
  }
}

/**
 * Download theme as JSON file
 */
export function downloadThemeFile(
  theme: ThemeConfig,
  filename = 'dicta-theme.json'
): void {
  const json = exportTheme(theme);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Read theme from uploaded file
 */
export function readThemeFile(
  file: File
): Promise<
  { success: true; theme: ThemeConfig } | { success: false; error: string }
> {
  return new Promise(resolve => {
    const reader = new FileReader();

    reader.onload = e => {
      try {
        const content = e.target?.result as string;
        const result = importTheme(content);
        resolve(result);
      } catch (error) {
        resolve({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to read file'
        });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, error: 'Failed to read file' });
    };

    reader.readAsText(file);
  });
}

/**
 * Compute derived style properties from theme
 * These are dynamic values calculated from base theme tokens
 */
export function computeDerivedStyles(theme: ThemeConfig) {
  return {
    borders: {
      light: '1px solid rgba(255, 255, 255, 0.1)',
      medium: '1px solid rgba(255, 255, 255, 0.3)',
      primary: `1px solid ${theme.colors.border.primary}`,
      secondary: `1px solid ${theme.colors.border.secondary}`,
      accent: `1px solid ${theme.colors.border.accent}`
    },
    shadows: {
      sm: '0 1px 3px rgba(0, 0, 0, 0.3)',
      md: '0 4px 6px rgba(0, 0, 0, 0.3)',
      lg: '2px 0 8px rgba(0, 0, 0, 0.5)',
      inner: 'inset 0 0 2px rgba(0, 0, 0, 0.3)'
    },
    charts: {
      bar: {
        fill: theme.colors.accent.blue.primary,
        rgb: hexToRgb(theme.colors.accent.blue.primary) || '59, 130, 246'
      },
      brush: {
        stroke: addAlpha(theme.colors.accent.blue.primary, 0.6),
        fill: addAlpha(theme.colors.accent.blue.primary, 0.08)
      }
    },
    components: {
      button: {
        base: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s'
        },
        icon: {
          padding: theme.spacing.sm,
          backgroundColor: 'transparent'
        },
        record: {
          padding: '15px 30px',
          fontSize: theme.typography.fontSize.lg,
          color: theme.colors.text.primary,
          border: 'none',
          borderRadius: theme.borderRadius.sm,
          transition: 'background-color 0.3s'
        }
      },
      card: {
        base: {
          backgroundColor: theme.colors.background.secondary,
          borderRadius: theme.borderRadius.lg,
          border: `1px solid ${theme.colors.border.primary}`,
          padding: theme.spacing.xl
        },
        hover: {
          backgroundColor: theme.colors.background.primary,
          borderColor: theme.colors.border.secondary
        }
      },
      sidebar: {
        base: {
          backgroundColor: theme.colors.background.secondary,
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.5)',
          borderRight: `1px solid ${theme.colors.border.primary}`
        }
      },
      input: {
        base: {
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          borderRadius: theme.borderRadius.sm,
          padding: theme.spacing.md,
          color: theme.colors.text.secondary
        }
      },
      proxyIndicator: {
        container: {
          padding: '3px 6px',
          color: theme.colors.text.secondary,
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(4px)',
          borderRadius: theme.borderRadius.md,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
        },
        dot: {
          width: '6px',
          height: '6px',
          borderRadius: theme.borderRadius.full
        }
      }
    },
    styleHelpers: {
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
  };
}

/**
 * Helper functions for color manipulation
 */

// Convert hex color to RGB string
function hexToRgb(hex: string): string | null {
  // Remove # if present
  const cleanHex = hex.replace('#', '');

  if (cleanHex.length !== 6) return null;

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return `${r}, ${g}, ${b}`;
}

// Add alpha channel to hex color
function addAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb}, ${alpha})`;
}

/**
 * Helper functions from design-system.ts
 */

export function getStatusColor(
  status: 'idle' | 'loading' | 'success' | 'error' | 'cancelled',
  theme: ThemeConfig
): string {
  return theme.colors.state[status];
}

export function getRecordButtonColor(
  isRecording: boolean,
  isLoading: boolean,
  theme: ThemeConfig
): string {
  if (isRecording) return theme.colors.accent.red.button;
  if (isLoading) return theme.colors.accent.gray.primary;
  return theme.colors.accent.green.button;
}
