import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { darkTheme, type PresetName } from './theme-presets';
import type { PartialThemeConfig, ThemeConfig } from './theme-schema';
import { validateTheme } from './theme-schema';
import { computeDerivedStyles, mergeTheme } from './theme-utils';

/**
 * Full theme includes base config + computed derived styles
 */
export interface Theme extends ThemeConfig {
  borders: ReturnType<typeof computeDerivedStyles>['borders'];
  shadows: ReturnType<typeof computeDerivedStyles>['shadows'];
  charts: ReturnType<typeof computeDerivedStyles>['charts'];
  components: ReturnType<typeof computeDerivedStyles>['components'];
  styleHelpers: ReturnType<typeof computeDerivedStyles>['styleHelpers'];
}

/**
 * Theme context value
 */
interface ThemeContextValue {
  theme: Theme;
  baseConfig: ThemeConfig;
  setTheme: (updates: PartialThemeConfig) => void;
  replaceTheme: (newTheme: ThemeConfig) => void;
  resetTheme: () => void;
  saveTheme: () => Promise<void>;
  loadTheme: () => Promise<void>;
  activePreset: PresetName | 'custom';
  setActivePreset: (preset: PresetName | 'custom') => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Hook to access theme context
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Theme Provider component
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Base theme configuration (the editable part)
  const [baseConfig, setBaseConfig] = useState<ThemeConfig>(darkTheme);

  // Active preset name
  const [activePreset, setActivePresetState] = useState<PresetName | 'custom'>('dark');

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Debounce timer for auto-save
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Compute full theme with derived properties
  const theme = useMemo<Theme>(() => {
    const derived = computeDerivedStyles(baseConfig);
    return {
      ...baseConfig,
      ...derived
    };
  }, [baseConfig]);

  /**
   * Load saved theme from file on mount
   */
  useEffect(() => {
    loadTheme();
  }, []);

  /**
   * Load theme from persistent storage
   */
  const loadTheme = async () => {
    setIsLoading(true);
    try {
      const result = await window.api?.theme.load();
      if (result?.success && result.theme) {
        const validation = validateTheme(result.theme);
        if (validation.success) {
          setBaseConfig(validation.data);
          setActivePresetState('custom');
          console.log('Loaded custom theme from file');
        } else {
          console.error('Invalid theme in file:', validation.error);
          // Fallback to default
          setBaseConfig(darkTheme);
          setActivePresetState('dark');
        }
      } else {
        // No saved theme, use default
        setBaseConfig(darkTheme);
        setActivePresetState('dark');
        console.log('No saved theme, using default dark theme');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      setBaseConfig(darkTheme);
      setActivePresetState('dark');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save theme to persistent storage (debounced)
   */
  const saveTheme = async () => {
    try {
      const result = await window.api?.theme.save(baseConfig);
      if (result?.success) {
        console.log('Theme saved successfully');
      } else {
        console.error('Failed to save theme:', result?.error);
      }
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  /**
   * Debounced auto-save
   * Automatically saves theme 500ms after last change
   */
  useEffect(() => {
    // Don't auto-save on initial load
    if (isLoading) return;

    // Clear existing timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    // Set new timer for auto-save
    saveTimerRef.current = setTimeout(() => {
      saveTheme();
    }, 500);

    // Cleanup on unmount
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [baseConfig, isLoading]);

  /**
   * Update theme with partial changes (deep merge)
   */
  const setTheme = (updates: PartialThemeConfig) => {
    setBaseConfig((prev) => mergeTheme(prev, updates));
    setActivePresetState('custom');
  };

  /**
   * Replace entire theme (used for presets)
   */
  const replaceTheme = (newTheme: ThemeConfig) => {
    setBaseConfig(newTheme);
  };

  /**
   * Reset to default dark theme
   */
  const resetTheme = async () => {
    try {
      await window.api?.theme.reset();
      setBaseConfig(darkTheme);
      setActivePresetState('dark');
      console.log('Theme reset to default');
    } catch (error) {
      console.error('Error resetting theme:', error);
    }
  };

  /**
   * Set active preset (convenience wrapper)
   */
  const setActivePreset = (preset: PresetName | 'custom') => {
    setActivePresetState(preset);
  };

  const value: ThemeContextValue = {
    theme,
    baseConfig,
    setTheme,
    replaceTheme,
    resetTheme,
    saveTheme,
    loadTheme,
    activePreset,
    setActivePreset
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
