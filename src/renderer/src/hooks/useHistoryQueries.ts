/**
 * History Query Hooks
 * React Query hooks for history IPC operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { Transcription } from '@/lib/history'

// Query keys
export const historyKeys = {
  all: ['history'] as const,
  lists: () => [...historyKeys.all, 'list'] as const,
  list: () => [...historyKeys.lists()] as const
}

/**
 * Query: Load all transcriptions
 */
export function useHistoryQuery() {
  return useQuery({
    queryKey: historyKeys.list(),
    queryFn: async () => {
      const result = await window.api?.history.loadAll()

      if (!result?.success) {
        throw new Error('Failed to load transcriptions')
      }

      return (result.transcriptions as Transcription[]) || []
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10 // 10 minutes
  })
}

/**
 * Mutation: Save transcription
 */
export function useSaveTranscriptionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (transcription: Transcription) => {
      const result = await window.api?.history.save(transcription)

      if (!result?.success) {
        throw new Error('Failed to save transcription')
      }

      return transcription
    },
    onSuccess: () => {
      // Invalidate and refetch history query
      queryClient.invalidateQueries({ queryKey: historyKeys.list() })
    },
    onError: (error) => {
      console.error('[History Mutation] Save failed:', error)
    }
  })
}

/**
 * Mutation: Delete transcription
 */
export function useDeleteTranscriptionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      // Assuming there's a delete API (to be implemented if needed)
      const result = await window.api?.history.delete?.(id)

      if (!result?.success) {
        throw new Error('Failed to delete transcription')
      }

      return id
    },
    onSuccess: () => {
      // Invalidate and refetch history query
      queryClient.invalidateQueries({ queryKey: historyKeys.list() })
    },
    onError: (error) => {
      console.error('[History Mutation] Delete failed:', error)
    }
  })
}

/**
 * Helper: Invalidate history cache manually
 */
export function useInvalidateHistory() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: historyKeys.list() })
  }
}
