import { useState, useEffect, useRef } from 'react';

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
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      analyserRef.current = null;

      return;
    }

    console.log('[VISUALIZER] Starting audio visualization, mediaStream:', mediaStream);

    // Setup Web Audio API
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

    // Update amplitudes in real-time
    const updateAmplitudes = () => {
      if (!analyserRef.current) return;

      analyser.getByteTimeDomainData(dataArray);

      // Calculate RMS amplitude from time domain data
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const normalized = (dataArray[i] - 128) / 128; // Normalize to -1 to 1
        sum += normalized * normalized;
      }
      const rms = Math.sqrt(sum / bufferLength);

      // Only update if amplitude is significant (avoid showing noise)
      if (rms > 0.01) {
        // Add new amplitude to array (keep last 50 values for smooth animation)
        setAmplitudes(prev => {
          const newAmplitudes = [...prev, rms];
          // Keep only last 50 values to avoid memory issues
          return newAmplitudes.slice(-50);
        });
      }

      animationFrameRef.current = requestAnimationFrame(updateAmplitudes);
    };

    updateAmplitudes();

    // Cleanup on unmount or when recording stops
    return () => {
      console.log('[VISUALIZER] Cleanup');
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      source.disconnect();
      audioContext.close();
    };
  }, [mediaStream, isRecording]);

  return amplitudes;
}
