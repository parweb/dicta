/**
 * Theme Store Hook
 * Jotai-based replacement for ThemeContext
 */

import { useAtom, useAtomValue } from 'jotai';
import { useCallback, useEffect } from 'react';

import { activePresetAtom, baseThemeConfigAtom, themeAtom } from '@/lib/store';
import { darkTheme } from '@/lib/theme-presets';
import type { PartialThemeConfig, ThemeConfig } from '@/lib/theme-schema';
import { validateTheme } from '@/lib/theme-schema';
import { mergeTheme } from '@/lib/theme-utils';

// Global state to prevent multiple simultaneous saves (survives HMR)
const globalState = {
  saveTimer: null as NodeJS.Timeout | null,
  lastSaveTime: 0,
  isSaving: false
};

export function useThemeStore() {
  const theme = useAtomValue(themeAtom);
  const [baseConfig, setBaseConfig] = useAtom(baseThemeConfigAtom);
  const [activePreset, setActivePreset] = useAtom(activePresetAtom);

  // Update theme with partial changes (deep merge)
  const setTheme = useCallback(
    (updates: PartialThemeConfig) => {
      setBaseConfig(prev => mergeTheme(prev, updates));
      setActivePreset('custom');
    },
    [setBaseConfig, setActivePreset]
  );

  // Replace entire theme (used for presets)
  const replaceTheme = useCallback(
    (newTheme: ThemeConfig) => {
      setBaseConfig(newTheme);
    },
    [setBaseConfig]
  );

  // Reset to default dark theme
  const resetTheme = useCallback(async () => {
    try {
      await window.api?.theme.reset();
      setBaseConfig(darkTheme);
      setActivePreset('dark');
      console.log('[THEME STORE] Theme reset to default');
    } catch (error) {
      console.error('[THEME STORE] Error resetting theme:', error);
    }
  }, [setBaseConfig, setActivePreset]);

  // Save theme to disk (with debounce and throttle)
  const saveTheme = useCallback(
    async (themeToSave?: ThemeConfig) => {
      const config = themeToSave || baseConfig;

      // Don't save if config is undefined
      if (!config) {
        console.warn('[THEME STORE] Cannot save undefined theme');
        return { success: false, error: 'Theme configuration is undefined' };
      }

      // Prevent multiple saves within 3 seconds
      const now = Date.now();
      if (now - globalState.lastSaveTime < 3000) {
        console.log('[THEME STORE] Skipping save (too soon after last save)');
        return { success: true };
      }

      // Prevent concurrent saves
      if (globalState.isSaving) {
        console.log('[THEME STORE] Skipping save (save already in progress)');
        return { success: true };
      }

      // Validate before saving
      const validation = validateTheme(config);
      if (!validation.success) {
        console.error('[THEME STORE] Invalid theme:', validation.error);
        return { success: false, error: validation.error };
      }

      try {
        globalState.isSaving = true;
        globalState.lastSaveTime = now;
        const result = await window.api?.theme.save(config);
        if (result?.success) {
          console.log('[THEME STORE] Theme saved successfully');
          return { success: true };
        }
        return { success: false, error: result?.error || 'Unknown error' };
      } catch (error) {
        console.error('[THEME STORE] Error saving theme:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      } finally {
        globalState.isSaving = false;
      }
    },
    [baseConfig]
  );

  // Load theme from disk
  const loadTheme = useCallback(async () => {
    try {
      const result = await window.api?.theme.load();
      if (result?.success && result.theme) {
        setBaseConfig(result.theme as ThemeConfig);
        console.log('[THEME STORE] Theme loaded successfully');
      }
    } catch (error) {
      console.error('[THEME STORE] Error loading theme:', error);
    }
  }, [setBaseConfig]);

  // Auto-save theme on changes (debounced)
  useEffect(() => {
    // Don't auto-save if baseConfig is undefined
    if (!baseConfig) {
      return;
    }

    if (globalState.saveTimer) {
      clearTimeout(globalState.saveTimer);
    }

    globalState.saveTimer = setTimeout(() => {
      saveTheme();
    }, 2000); // Save 2 seconds after last change

    return () => {
      if (globalState.saveTimer) {
        clearTimeout(globalState.saveTimer);
        globalState.saveTimer = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseConfig]); // saveTheme deliberately omitted to avoid infinite loop

  return {
    theme,
    baseConfig,
    activePreset,
    setTheme,
    replaceTheme,
    resetTheme,
    saveTheme,
    loadTheme,
    setActivePreset
  };
}
