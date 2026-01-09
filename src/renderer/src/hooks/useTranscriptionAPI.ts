import { useState, useCallback } from 'react';

import type { Transcription } from '../lib/history';

export type ProxyStatus = 'idle' | 'loading' | 'success' | 'error' | 'cancelled';

export interface ProxyConfig {
  name: string;
  url: string;
}

interface TranscriptionResponse {
  text: string;
}

const PROXY_CONFIGS: ProxyConfig[] = [
  {
    name: 'corsfix',
    url: 'https://proxy.corsfix.com/?https://api.openai.com/v1/audio/transcriptions'
  },
  {
    name: 'corsproxy',
    url: 'https://corsproxy.io/?https://api.openai.com/v1/audio/transcriptions'
  }
];

const INITIAL_PROXY_STATUSES: Record<string, ProxyStatus> = PROXY_CONFIGS.reduce(
  (acc, proxy) => ({ ...acc, [proxy.name]: 'idle' as ProxyStatus }),
  {}
);

// SECURITY: Move API key to environment variables
const apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';

export interface UseTranscriptionAPIReturn {
  transcribeAudio: (
    blob: Blob,
    durationMs?: number,
    audioAmplitudes?: number[]
  ) => Promise<string | undefined>;
  proxyStatuses: Record<string, ProxyStatus>;
  isLoading: boolean;
  saveToHistory: (
    text: string,
    durationMs?: number,
    audioAmplitudes?: number[]
  ) => Promise<Transcription | undefined>;
  analyzeAudio: (blob: Blob) => Promise<{ durationMs?: number; amplitudes: number[] }>;
}

export function useTranscriptionAPI(
  onHistoryUpdate?: () => Promise<void>
): UseTranscriptionAPIReturn {
  const [proxyStatuses, setProxyStatuses] =
    useState<Record<string, ProxyStatus>>(INITIAL_PROXY_STATUSES);
  const [isLoading, setIsLoading] = useState(false);

  // Extract audio duration and amplitude data from blob using Web Audio API
  const analyzeAudio = useCallback(
    async (blob: Blob): Promise<{ durationMs?: number; amplitudes: number[] }> => {
      try {
        const arrayBuffer = await blob.arrayBuffer();
        const audioContext = new AudioContext();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Extract audio samples from first channel
        const channelData = audioBuffer.getChannelData(0);
        const samples = channelData.length;
        const durationMs = audioBuffer.duration * 1000; // Convert to milliseconds for precision

        // Calculate amplitudes for visualization (divide into ~200 segments)
        const segmentCount = Math.min(200, Math.floor(samples / 100));
        const samplesPerSegment = Math.floor(samples / segmentCount);
        const amplitudes: number[] = [];

        for (let i = 0; i < segmentCount; i++) {
          const start = i * samplesPerSegment;
          const end = start + samplesPerSegment;
          let sum = 0;

          // Calculate RMS (Root Mean Square) for this segment
          for (let j = start; j < end && j < samples; j++) {
            sum += channelData[j] * channelData[j];
          }

          const rms = Math.sqrt(sum / samplesPerSegment);
          amplitudes.push(rms);
        }

        await audioContext.close();
        return { durationMs, amplitudes };
      } catch (error) {
        console.error('Error analyzing audio:', error);
        return { amplitudes: [] };
      }
    },
    []
  );

  // Save transcription to history
  const saveToHistory = useCallback(
    async (
      text: string,
      durationMs?: number,
      audioAmplitudes?: number[]
    ): Promise<Transcription | undefined> => {
      try {
        const transcription: Transcription = {
          id: `${Date.now()}`,
          text,
          timestamp: Date.now(),
          durationMs,
          audioAmplitudes
        };
        await window.api?.history.save(transcription);

        // Trigger history reload if callback provided
        if (onHistoryUpdate) {
          await onHistoryUpdate();
        }

        return transcription;
      } catch (error) {
        console.error('Error saving to history:', error);
        return undefined;
      }
    },
    [onHistoryUpdate]
  );

  const transcribeAudio = useCallback(
    async (
      blob: Blob,
      durationMs?: number,
      audioAmplitudes?: number[]
    ): Promise<string | undefined> => {
      if (!apiKey) {
        console.error('API key is not configured');
        return undefined;
      }

      setIsLoading(true);

      const formData = new FormData();
      formData.append('file', blob, 'recording.webm');
      formData.append('model', 'gpt-4o-transcribe');

      // Reset proxy statuses
      setProxyStatuses(
        PROXY_CONFIGS.reduce(
          (acc, proxy) => ({ ...acc, [proxy.name]: 'loading' as ProxyStatus }),
          {}
        )
      );

      // Fetch with specific proxy
      const fetchWithProxy = async (proxy: ProxyConfig): Promise<TranscriptionResponse> => {
        try {
          const response = await fetch(proxy.url, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`
            },
            body: formData
          });

          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            setProxyStatuses(prev => ({ ...prev, [proxy.name]: 'error' }));
            throw new Error(data.error?.message || `Proxy error: ${proxy.name}`);
          }

          const data: TranscriptionResponse = await response.json();
          setProxyStatuses(prev => ({ ...prev, [proxy.name]: 'success' }));
          return data;
        } catch (error) {
          setProxyStatuses(prev => ({ ...prev, [proxy.name]: 'error' }));
          throw error;
        }
      };

      try {
        // Promise.any() returns the first successful promise
        const data = await Promise.any(PROXY_CONFIGS.map(proxy => fetchWithProxy(proxy)));

        // Mark remaining proxies as cancelled
        setProxyStatuses(prev => {
          const newStatuses = { ...prev };
          Object.keys(newStatuses).forEach(key => {
            if (newStatuses[key] === 'loading') {
              newStatuses[key] = 'cancelled';
            }
          });
          return newStatuses;
        });

        // Copy to clipboard
        await navigator.clipboard.writeText(data.text);

        // Save to history
        await saveToHistory(data.text, durationMs, audioAmplitudes);

        setIsLoading(false);
        return data.text;
      } catch (error) {
        setIsLoading(false);
        if (error instanceof AggregateError) {
          console.error('All proxies failed:', error.errors);
        } else {
          console.error('Transcription error:', error);
        }
        return undefined;
      }
    },
    [saveToHistory]
  );

  return {
    transcribeAudio,
    proxyStatuses,
    isLoading,
    saveToHistory,
    analyzeAudio
  };
}
