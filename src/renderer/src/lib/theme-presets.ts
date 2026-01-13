import type { ThemeConfig } from './theme-schema';

/**
 * Theme Presets for Dicta
 *
 * Contains predefined themes: dark (current), light, and high contrast
 */

// Environment-aware colors for dev mode
// In dev mode, use bright red background to differentiate from production
const isDev = import.meta.env.DEV;

console.log('[THEME-PRESETS] Environment:', import.meta.env.MODE);
console.log('[THEME-PRESETS] isDev:', isDev);

/**
 * Dark Theme - Current design system (default)
 */
export const darkTheme: ThemeConfig = {
  colors: {
    background: {
      primary: isDev ? '#2d0a0a' : '#0f172a', // Dark red in dev, slate in prod
      secondary: isDev ? '#3d1515' : '#1e293b',
      tertiary: isDev ? '#4d2020' : '#334155',
      overlay: 'rgba(0, 0, 0, 0.5)'
    },
    text: {
      primary: '#f9fafb',
      secondary: '#e5e7eb',
      tertiary: '#94a3b8',
      disabled: '#64748b'
    },
    border: {
      primary: isDev ? '#5d3030' : '#334155',
      secondary: isDev ? '#6d4040' : '#475569',
      accent: isDev ? '#ef4444' : '#0ea5e9'
    },
    accent: {
      blue: {
        primary: isDev ? '#ef4444' : '#0ea5e9',
        light: isDev ? '#f87171' : '#38bdf8',
        dark: isDev ? '#7f1d1d' : '#0c4a6e',
        background: isDev ? 'rgba(239, 68, 68, 0.1)' : 'rgba(14, 165, 233, 0.1)',
        backgroundHover: isDev ? 'rgba(239, 68, 68, 0.15)' : 'rgba(14, 165, 233, 0.15)',
        backgroundActive: isDev ? 'rgba(239, 68, 68, 0.2)' : 'rgba(14, 165, 233, 0.2)'
      },
      green: {
        primary: '#4ade80',
        button: '#4CAF50'
      },
      red: {
        primary: '#ef4444',
        button: '#ff4444'
      },
      yellow: {
        primary: '#eab308',
        light: '#fef08a',
        background: 'rgba(234, 179, 8, 0.1)'
      },
      gray: {
        primary: '#9ca3af',
        light: '#d1d5db'
      }
    },
    state: {
      success: '#4ade80',
      error: '#ef4444',
      loading: '#ffffff',
      cancelled: '#9ca3af',
      idle: '#d1d5db'
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '40px'
  },
  typography: {
    fontSize: {
      xs: '10px',
      sm: '11px',
      base: '14px',
      lg: '18px',
      xl: '24px',
      '2xl': '32px'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: '1.2',
      normal: '1.4',
      relaxed: '1.6',
      loose: '1.8'
    },
    letterSpacing: {
      tight: '0px',
      normal: '0px',
      wide: '0px',
      wider: '1px'
    }
  },
  borderRadius: {
    xs: '1px',
    sm: '5px',
    md: '6px',
    lg: '8px',
    full: '50%'
  }
};

/**
 * Light Theme - Inverted color scheme for daytime use
 */
export const lightTheme: ThemeConfig = {
  colors: {
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
      overlay: 'rgba(0, 0, 0, 0.3)'
    },
    text: {
      primary: '#0f172a',
      secondary: '#334155',
      tertiary: '#64748b',
      disabled: '#94a3b8'
    },
    border: {
      primary: '#e2e8f0',
      secondary: '#cbd5e1',
      accent: '#0ea5e9'
    },
    accent: {
      blue: {
        primary: '#0ea5e9',
        light: '#38bdf8',
        dark: '#0369a1',
        background: 'rgba(14, 165, 233, 0.08)',
        backgroundHover: 'rgba(14, 165, 233, 0.12)',
        backgroundActive: 'rgba(14, 165, 233, 0.16)'
      },
      green: {
        primary: '#22c55e',
        button: '#16a34a'
      },
      red: {
        primary: '#ef4444',
        button: '#dc2626'
      },
      yellow: {
        primary: '#eab308',
        light: '#fde047',
        background: 'rgba(234, 179, 8, 0.08)'
      },
      gray: {
        primary: '#6b7280',
        light: '#9ca3af'
      }
    },
    state: {
      success: '#22c55e',
      error: '#ef4444',
      loading: '#0f172a',
      cancelled: '#6b7280',
      idle: '#9ca3af'
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '40px'
  },
  typography: {
    fontSize: {
      xs: '10px',
      sm: '11px',
      base: '14px',
      lg: '18px',
      xl: '24px',
      '2xl': '32px'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: '1.2',
      normal: '1.4',
      relaxed: '1.6',
      loose: '1.8'
    },
    letterSpacing: {
      tight: '0px',
      normal: '0px',
      wide: '0px',
      wider: '1px'
    }
  },
  borderRadius: {
    xs: '1px',
    sm: '5px',
    md: '6px',
    lg: '8px',
    full: '50%'
  }
};

/**
 * High Contrast Theme - WCAG AAA compliant for accessibility
 */
export const highContrastTheme: ThemeConfig = {
  colors: {
    background: {
      primary: '#000000',
      secondary: '#1a1a1a',
      tertiary: '#2d2d2d',
      overlay: 'rgba(0, 0, 0, 0.8)'
    },
    text: {
      primary: '#ffffff',
      secondary: '#ffffff',
      tertiary: '#e0e0e0',
      disabled: '#808080'
    },
    border: {
      primary: '#ffffff',
      secondary: '#cccccc',
      accent: '#00d4ff'
    },
    accent: {
      blue: {
        primary: '#00d4ff',
        light: '#66e4ff',
        dark: '#0088cc',
        background: 'rgba(0, 212, 255, 0.15)',
        backgroundHover: 'rgba(0, 212, 255, 0.25)',
        backgroundActive: 'rgba(0, 212, 255, 0.35)'
      },
      green: {
        primary: '#00ff00',
        button: '#00cc00'
      },
      red: {
        primary: '#ff0000',
        button: '#cc0000'
      },
      yellow: {
        primary: '#ffff00',
        light: '#ffff99',
        background: 'rgba(255, 255, 0, 0.15)'
      },
      gray: {
        primary: '#cccccc',
        light: '#e0e0e0'
      }
    },
    state: {
      success: '#00ff00',
      error: '#ff0000',
      loading: '#ffffff',
      cancelled: '#cccccc',
      idle: '#808080'
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '40px'
  },
  typography: {
    fontSize: {
      xs: '11px',
      sm: '13px',
      base: '16px',
      lg: '20px',
      xl: '26px',
      '2xl': '34px'
    },
    fontWeight: {
      normal: 400,
      medium: 600,
      semibold: 700,
      bold: 800
    },
    lineHeight: {
      tight: '1.3',
      normal: '1.5',
      relaxed: '1.7',
      loose: '2.0'
    },
    letterSpacing: {
      tight: '0px',
      normal: '0px',
      wide: '1px',
      wider: '2px'
    }
  },
  borderRadius: {
    xs: '2px',
    sm: '4px',
    md: '6px',
    lg: '8px',
    full: '50%'
  }
};

/**
 * Preset themes collection
 */
export const PRESET_THEMES = {
  dark: darkTheme,
  light: lightTheme,
  highContrast: highContrastTheme
} as const;

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
} as const;

export type PresetName = keyof typeof PRESET_THEMES;
