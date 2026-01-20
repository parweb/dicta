/**
 * Navigation Hook
 * Manages view navigation with history support
 */

import { useState, useCallback } from 'react'

export type ViewType = 'home' | 'statistics' | 'settings'
export type SettingsTab = 'theme' | 'model' | 'bedrock'

interface NavigationState {
  currentView: ViewType
  settingsTab: SettingsTab
  history: ViewType[]
}

interface UseNavigationReturn {
  currentView: ViewType
  settingsTab: SettingsTab
  navigateTo: (view: ViewType, tab?: SettingsTab) => void
  navigateBack: () => boolean
  canGoBack: boolean
}

export function useNavigation(): UseNavigationReturn {
  const [state, setState] = useState<NavigationState>({
    currentView: 'home',
    settingsTab: 'theme',
    history: []
  })

  const navigateTo = useCallback((view: ViewType, tab?: SettingsTab) => {
    setState((prev) => ({
      currentView: view,
      settingsTab: tab ?? prev.settingsTab,
      history: prev.currentView !== view ? [...prev.history, prev.currentView] : prev.history
    }))
  }, [])

  const navigateBack = useCallback((): boolean => {
    if (state.history.length === 0) return false

    setState((prev) => {
      const newHistory = [...prev.history]
      const previousView = newHistory.pop()!
      return {
        ...prev,
        currentView: previousView,
        history: newHistory
      }
    })

    return true
  }, [state.history.length])

  return {
    currentView: state.currentView,
    settingsTab: state.settingsTab,
    navigateTo,
    navigateBack,
    canGoBack: state.history.length > 0
  }
}
