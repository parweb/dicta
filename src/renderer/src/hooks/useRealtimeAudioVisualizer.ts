import { useState, useEffect, useRef } from 'react';

async function closeAudioContextSafely(
  audioContext: AudioContext | null
): Promise<void> {
  if (!audioContext || audioContext.state === 'closed') {
    return;
  }

  try {
    await audioContext.close();
  } catch (error) {
    // React StrictMode can trigger duplicate effect cleanup in development.
    if (
      error instanceof DOMException &&
      error.name === 'InvalidStateError'
    ) {
      return;
    }
    console.warn('[VISUALIZER] Failed to close AudioContext:', error);
  }
}

/**
 * Hook to capture real-time audio amplitudes during recording
 * Uses Web Audio API's AnalyserNode to extract frequency data
 */
export function useRealtimeAudioVisualizer(
  mediaStream: MediaStream | null,
  isRecording: boolean
) {
  const [amplitudes, setAmplitudes] = useState<number[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!mediaStream || !isRecording) {
      // Reset amplitudes when not recording
      setAmplitudes([]);

      // Cleanup
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (audioContextRef.current) {
        void closeAudioContextSafely(audioContextRef.current);
        audioContextRef.current = null;
      }
      analyserRef.current = null;

      return;
    }

    console.log('[VISUALIZER] Starting audio visualization, mediaStream:', mediaStream);

    // Setup Web Audio API
    if (audioContextRef.current) {
      void closeAudioContextSafely(audioContextRef.current);
      audioContextRef.current = null;
    }
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512; // Increased for better resolution
    analyser.smoothingTimeConstant = 0.5; // Less smoothing for more reactive display
    analyserRef.current = analyser;

    const source = audioContext.createMediaStreamSource(mediaStream);
    source.connect(analyser);

    // Buffer for time domain data (actual waveform)
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    console.log('[VISUALIZER] Analyser setup complete, bufferLength:', bufferLength);

    // Throttle updates to ~20 times per second for better visual accumulation
    let lastUpdateTime = 0;
    const updateInterval = 50; // 50ms = 20 updates per second

    // Update amplitudes in real-time
    const updateAmplitudes = (timestamp: number) => {
      if (!analyserRef.current) return;

      // Throttle updates
      if (timestamp - lastUpdateTime >= updateInterval) {
        lastUpdateTime = timestamp;

        analyser.getByteTimeDomainData(dataArray);

        // Calculate RMS amplitude from time domain data
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          const normalized = (dataArray[i] - 128) / 128; // Normalize to -1 to 1
          sum += normalized * normalized;
        }
        const rms = Math.sqrt(sum / bufferLength);

        // Add new amplitude to array (accumulate all values)
        setAmplitudes(prev => [...prev, rms]);
      }

      animationFrameRef.current = requestAnimationFrame(updateAmplitudes);
    };

    animationFrameRef.current = requestAnimationFrame(updateAmplitudes);

    // Cleanup on unmount or when recording stops
    return () => {
      console.log('[VISUALIZER] Cleanup');
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      source.disconnect();
      void closeAudioContextSafely(audioContext);
      if (audioContextRef.current === audioContext) {
        audioContextRef.current = null;
      }
      analyserRef.current = null;
    };
  }, [mediaStream, isRecording]);

  return amplitudes;
}
