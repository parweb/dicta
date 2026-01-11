import { useState, useEffect, useCallback } from 'react';

import type { Transcription } from '../lib/history';

export interface UseTranscriptionNavigationReturn {
  allTranscriptions: Transcription[];
  currentTranscriptionId: string | null;
  slideDirection: 'up' | 'down' | null;
  navigateTranscription: (direction: 'next' | 'previous') => void;
  setCurrentTranscriptionId: (id: string | null) => void;
  reloadTranscriptions: () => Promise<void>;
}

export function useTranscriptionNavigation(): UseTranscriptionNavigationReturn {
  const [allTranscriptions, setAllTranscriptions] = useState<Transcription[]>(
    []
  );
  const [currentTranscriptionId, setCurrentTranscriptionId] = useState<
    string | null
  >(null);
  const [slideDirection, setSlideDirection] = useState<'up' | 'down' | null>(
    null
  );

  // Load all transcriptions for navigation
  const reloadTranscriptions = useCallback(async () => {
    try {
      const result = await window.api?.history.loadAll();
      if (result?.success && result.transcriptions) {
        const transcriptions = result.transcriptions as Transcription[];
        // Sort by timestamp (most recent first)
        transcriptions.sort((a, b) => b.timestamp - a.timestamp);
        setAllTranscriptions(transcriptions);
      }
    } catch (error) {
      console.error('Error loading transcriptions:', error);
    }
  }, []);

  useEffect(() => {
    reloadTranscriptions();
  }, [reloadTranscriptions]);

  // Navigate to next/previous transcription
  const navigateTranscription = useCallback(
    (direction: 'next' | 'previous') => {
      if (allTranscriptions.length === 0) return;

      let targetIndex = 0;
      if (currentTranscriptionId) {
        const currentIndex = allTranscriptions.findIndex(
          t => t.id === currentTranscriptionId
        );
        if (currentIndex !== -1) {
          if (direction === 'next') {
            // Next = more recent (lower index, since sorted desc by timestamp)
            targetIndex = Math.max(0, currentIndex - 1);
          } else {
            // Previous = older (higher index)
            targetIndex = Math.min(
              allTranscriptions.length - 1,
              currentIndex + 1
            );
          }
        }
      }

      const targetTranscription = allTranscriptions[targetIndex];
      if (targetTranscription) {
        // Set slide direction for animation
        setSlideDirection(direction === 'next' ? 'up' : 'down');

        // Update current transcription ID
        setCurrentTranscriptionId(targetTranscription.id);

        // Reset animation after a delay
        setTimeout(() => setSlideDirection(null), 300);
      }
    },
    [allTranscriptions, currentTranscriptionId]
  );

  return {
    allTranscriptions,
    currentTranscriptionId,
    slideDirection,
    navigateTranscription,
    setCurrentTranscriptionId,
    reloadTranscriptions
  };
}
