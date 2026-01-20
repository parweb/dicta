/**
 * Jotai Global Store
 * Centralized atoms for application state management
 */

import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import type { ThemeConfig } from './theme-schema'
import { darkTheme, type PresetName } from './theme-presets'
import { computeDerivedStyles } from './theme-utils'
import type { Theme } from './theme-context'

// ============================================================================
// API KEY ATOMS
// ============================================================================

export const apiKeyAtom = atom<string | null>(null)
export const isApiKeyLoadingAtom = atom(false)
export const isEncryptionAvailableAtom = atom(false)

// Derived atom: hasApiKey
export const hasApiKeyAtom = atom((get) => !!get(apiKeyAtom))

// ============================================================================
// THEME ATOMS
// ============================================================================

// Base theme config (stored)
export const baseThemeConfigAtom = atomWithStorage<ThemeConfig>(
  'dicta-theme',
  darkTheme
)

// Active preset name
export const activePresetAtom = atomWithStorage<PresetName | 'custom'>(
  'dicta-active-preset',
  'dark'
)

// Derived atom: full theme with computed styles
export const themeAtom = atom<Theme>((get) => {
  const baseConfig = get(baseThemeConfigAtom)
  const derived = computeDerivedStyles(baseConfig)

  return {
    ...baseConfig,
    ...derived
  } as Theme
})

// ============================================================================
// NAVIGATION ATOMS
// ============================================================================

export type ViewType = 'home' | 'statistics' | 'settings'
export type SettingsTab = 'theme' | 'model' | 'bedrock' | 'updates'

export const currentViewAtom = atom<ViewType>('home')
export const settingsTabAtom = atom<SettingsTab>('theme')
export const navigationHistoryAtom = atom<ViewType[]>([])

// Derived atom: canGoBack
export const canGoBackAtom = atom((get) => get(navigationHistoryAtom).length > 0)

// ============================================================================
// BEDROCK ATOMS
// ============================================================================

export interface BedrockCredentials {
  apiKey: string
  region: string
  modelId: string
}

export const bedrockCredentialsAtom = atom<BedrockCredentials | null>(null)
export const isBedrockLoadingAtom = atom(false)
export const isBedrockEncryptionAvailableAtom = atom(false)

// Derived atom: hasBedrockCredentials
export const hasBedrockCredentialsAtom = atom(
  (get) => !!get(bedrockCredentialsAtom)?.apiKey
)
