/**
 * TanStack Query configuration
 * Centralized QueryClient setup with default options
 */

import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - data is fresh for 5 min
      gcTime: 1000 * 60 * 10, // 10 minutes - cache persists for 10 min
      refetchOnWindowFocus: false, // Don't refetch on window focus (Electron app)
      refetchOnMount: false, // Don't refetch on mount if data is fresh
      retry: 1, // Retry failed requests once
      retryDelay: 1000 // 1 second between retries
    },
    mutations: {
      retry: 0, // Don't retry mutations by default
      onError: (error) => {
        console.error('[React Query] Mutation error:', error)
      }
    }
  }
})
