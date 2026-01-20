/**
 * Navigation Store Hook
 * Jotai-based replacement for useNavigation hook
 */

import { useAtom, useAtomValue } from 'jotai'
import { useCallback } from 'react'

import {
  canGoBackAtom,
  currentViewAtom,
  navigationHistoryAtom,
  settingsTabAtom,
  type ViewType,
  type SettingsTab
} from '@/lib/store'

export function useNavigationStore() {
  const [currentView, setCurrentView] = useAtom(currentViewAtom)
  const [settingsTab, setSettingsTab] = useAtom(settingsTabAtom)
  const [history, setHistory] = useAtom(navigationHistoryAtom)
  const canGoBack = useAtomValue(canGoBackAtom)

  // Navigate to a view
  const navigateTo = useCallback(
    (view: ViewType, tab?: SettingsTab) => {
      // Add current view to history if changing views
      if (currentView !== view) {
        setHistory((prev) => [...prev, currentView])
      }

      setCurrentView(view)

      // Update settings tab if provided
      if (tab) {
        setSettingsTab(tab)
      }
    },
    [currentView, setCurrentView, setSettingsTab, setHistory]
  )

  // Navigate back
  const navigateBack = useCallback((): boolean => {
    if (history.length === 0) return false

    const newHistory = [...history]
    const previousView = newHistory.pop()!

    setHistory(newHistory)
    setCurrentView(previousView)

    return true
  }, [history, setHistory, setCurrentView])

  return {
    currentView,
    settingsTab,
    navigateTo,
    navigateBack,
    canGoBack
  }
}
