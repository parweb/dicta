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
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
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
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaStream]);

  const startRecording = useCallback(
    async (onAudioReady: (audioBlob: Blob) => Promise<void>) => {
      try {
        setIsRecording(true);
        audioChunks.current = [];
        onAudioReadyCallback.current = onAudioReady;

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true
        });
        setMediaStream(stream);

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

          // Cleanup stream (will be done by state update)
          setMediaStream(null);
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
    mediaStream
  };
}
