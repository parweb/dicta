import { useState, useEffect, useCallback } from 'react';

import type { Transcription } from '../lib/history';

export interface UseHistoryDataReturn {
  transcriptions: Transcription[];
  isLoading: boolean;
  loadHistory: () => Promise<void>;
}

export function useHistoryData(loadOnMount = false): UseHistoryDataReturn {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await window.api?.history.loadAll();
      if (result?.success && result.transcriptions) {
        setTranscriptions(result.transcriptions as Transcription[]);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loadOnMount) {
      loadHistory();
    }
  }, [loadOnMount, loadHistory]);

  return {
    transcriptions,
    isLoading,
    loadHistory
  };
}
