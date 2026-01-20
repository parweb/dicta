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

    // Setup Web Audio API
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256; // Small FFT for better performance
    analyser.smoothingTimeConstant = 0.8;
    analyserRef.current = analyser;

    const source = audioContext.createMediaStreamSource(mediaStream);
    source.connect(analyser);

    // Buffer for frequency data
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Update amplitudes in real-time
    const updateAmplitudes = () => {
      if (!analyserRef.current) return;

      analyser.getByteFrequencyData(dataArray);

      // Calculate RMS amplitude from frequency data
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const normalized = dataArray[i] / 255; // Normalize to 0-1
        sum += normalized * normalized;
      }
      const rms = Math.sqrt(sum / bufferLength);

      // Add new amplitude to array (keep last 100 values for smooth animation)
      setAmplitudes(prev => {
        const newAmplitudes = [...prev, rms];
        // Keep only last 100 values to avoid memory issues
        return newAmplitudes.slice(-100);
      });

      animationFrameRef.current = requestAnimationFrame(updateAmplitudes);
    };

    updateAmplitudes();

    // Cleanup on unmount or when recording stops
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      source.disconnect();
      audioContext.close();
    };
  }, [mediaStream, isRecording]);

  return amplitudes;
}
