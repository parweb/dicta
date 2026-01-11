import { useState, useRef, useEffect, useCallback } from 'react';

export interface UseAudioRecorderReturn {
  isRecording: boolean;
  startRecording: (
    onAudioReady: (audioBlob: Blob) => Promise<void>
  ) => Promise<void>;
  stopRecording: () => void;
  mediaStream: MediaStream | null;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const mediaStream = useRef<MediaStream | null>(null);
  const onAudioReadyCallback = useRef<
    ((audioBlob: Blob) => Promise<void>) | null
  >(null);

  // Request microphone permissions on mount
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(stream => {
        // Stop the stream immediately, we just wanted to request permission
        stream.getTracks().forEach(track => track.stop());
      })
      .catch(err => console.error('Microphone access denied:', err));
  }, []);

  // Cleanup media stream on unmount
  useEffect(() => {
    return () => {
      if (mediaStream.current) {
        mediaStream.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = useCallback(
    async (onAudioReady: (audioBlob: Blob) => Promise<void>) => {
      try {
        setIsRecording(true);
        audioChunks.current = [];
        onAudioReadyCallback.current = onAudioReady;

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true
        });
        mediaStream.current = stream;

        const recorder = new MediaRecorder(stream);
        mediaRecorder.current = recorder;

        recorder.ondataavailable = (e: BlobEvent) => {
          if (e.data.size > 0) {
            audioChunks.current.push(e.data);
          }
        };

        recorder.onstop = async () => {
          // Create audio blob
          const audioBlob = new Blob(audioChunks.current, {
            type: 'audio/webm'
          });

          // Call the callback with the audio blob
          if (onAudioReadyCallback.current) {
            await onAudioReadyCallback.current(audioBlob);
          }

          // Cleanup stream
          if (mediaStream.current) {
            mediaStream.current.getTracks().forEach(track => track.stop());
            mediaStream.current = null;
          }
        };

        recorder.start();
      } catch (error) {
        console.error('Failed to start recording:', error);
        setIsRecording(false);
      }
    },
    []
  );

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
      setIsRecording(false);
      window.api?.send('stop-recording');
    }
  }, []);

  return {
    isRecording,
    startRecording,
    stopRecording,
    mediaStream: mediaStream.current
  };
}
