import { Loader2, Mic, MicOff } from 'lucide-react';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

import AudioWaveform from '../components/AudioWaveform';
import Layout from '../components/Layout';
import {
  borderRadius,
  colors,
  components,
  getRecordButtonColor,
  getStatusColor,
  spacing,
  typography
} from '../lib/design-system';
import type { Transcription } from '../lib/history';
import Statistics from './Statistics';

// SECURITY: Move API key to environment variables
const apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';

type ProxyStatus = 'idle' | 'loading' | 'success' | 'error' | 'cancelled';

interface ProxyConfig {
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

const INITIAL_PROXY_STATUSES: Record<string, ProxyStatus> =
  PROXY_CONFIGS.reduce(
    (acc, proxy) => ({ ...acc, [proxy.name]: 'idle' as ProxyStatus }),
    {}
  );

const HomePage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [proxyStatuses, setProxyStatuses] = useState<
    Record<string, ProxyStatus>
  >(INITIAL_PROXY_STATUSES);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'statistics'>('home');
  const [audioAmplitudes, setAudioAmplitudes] = useState<number[]>([]);
  const [audioDuration, setAudioDuration] = useState<number | undefined>(undefined);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const transcriptRef = useRef<HTMLParagraphElement | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  const xKeyIsDown = useRef(false);

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

  // Extract audio duration and amplitude data from blob using Web Audio API
  const analyzeAudio = useCallback(async (blob: Blob): Promise<{ duration?: number; amplitudes: number[] }> => {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Extract audio samples from first channel
      const channelData = audioBuffer.getChannelData(0);
      const samples = channelData.length;
      const duration = audioBuffer.duration;

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
      return { duration, amplitudes };
    } catch (error) {
      console.error('Error analyzing audio:', error);
      return { amplitudes: [] };
    }
  }, []);

  // Save transcription to history
  const saveToHistory = useCallback(
    async (text: string, durationSeconds?: number, audioAmplitudes?: number[]) => {
      try {
        const transcription: Transcription = {
          id: `${Date.now()}`,
          text,
          timestamp: Date.now(),
          durationSeconds,
          audioAmplitudes
        };
        await window.api?.history.save(transcription);
      } catch (error) {
        console.error('Error saving to history:', error);
      }
    },
    []
  );

  const transcribeAudio = useCallback(
    async (blob: Blob, durationSeconds?: number, audioAmplitudes?: number[]) => {
      if (!apiKey) {
        console.error('API key is not configured');
        return;
      }

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
      const fetchWithProxy = async (
        proxy: ProxyConfig
      ): Promise<TranscriptionResponse> => {
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
            throw new Error(
              data.error?.message || `Proxy error: ${proxy.name}`
            );
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
        const data = await Promise.any(
          PROXY_CONFIGS.map(proxy => fetchWithProxy(proxy))
        );

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

        setTranscript(data.text);
        await navigator.clipboard.writeText(data.text);
        // Save to history
        await saveToHistory(data.text, durationSeconds, audioAmplitudes);
      } catch (error) {
        if (error instanceof AggregateError) {
          console.error('All proxies failed:', error.errors);
        } else {
          console.error('Transcription error:', error);
        }
      }
    },
    [saveToHistory]
  );

  const startRecording = useCallback(async () => {
    try {
      // Switch to home view and close sidebar when starting recording
      setCurrentView('home');
      setIsHistoryOpen(false);

      setIsRecording(true);
      audioChunks.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStream.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorder.current = recorder;

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) {
          audioChunks.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        setIsLoading(true);

        // Create audio blob and analyze it (duration + amplitudes)
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        const { duration, amplitudes } = await analyzeAudio(audioBlob);

        // Store duration and amplitudes for visualization
        setAudioDuration(duration);
        setAudioAmplitudes(amplitudes);

        await transcribeAudio(audioBlob, duration, amplitudes);
        setIsLoading(false);

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
  }, [transcribeAudio, analyzeAudio]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
      setIsRecording(false);
      window.api?.send('stop-recording');
    }
  }, []);

  // Hot key handler
  useEffect(() => {
    const handler = () => {
      startRecording();
    };

    window.api?.on('show-mini-app-hot-key', handler);
    return () => {
      window.api?.removeListener('show-mini-app-hot-key', handler);
    };
  }, [startRecording]);

  // Keyboard shortcut handler (X key)
  useEffect(() => {
    const controller = new AbortController();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'x' && !xKeyIsDown.current) {
        xKeyIsDown.current = true;
        startRecording();
      }
    };

    const handleKeyUp = () => {
      if (isRecording) {
        xKeyIsDown.current = false;
        stopRecording();
      }
    };

    document.addEventListener('keydown', handleKeyDown, {
      signal: controller.signal
    });
    document.addEventListener('keyup', handleKeyUp, {
      signal: controller.signal
    });

    return () => {
      controller.abort();
    };
  }, [isRecording, startRecording, stopRecording]);

  // Auto-select transcript text
  useEffect(() => {
    if (transcript && transcriptRef.current) {
      const range = document.createRange();
      const selection = window.getSelection();
      if (selection) {
        range.selectNodeContents(transcriptRef.current);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }, [transcript]);

  const handleCopyTranscript = useCallback(() => {
    if (transcript) {
      navigator.clipboard.writeText(transcript);
    }
  }, [transcript]);

  const handleSelectTranscription = useCallback((transcription: Transcription) => {
    setTranscript(transcription.text);
    setAudioAmplitudes(transcription.audioAmplitudes || []);
    setAudioDuration(transcription.durationSeconds);
    setIsHistoryOpen(false);
  }, []);

  const proxyStatusEntries = useMemo(
    () => Object.entries(proxyStatuses),
    [proxyStatuses]
  );

  return (
    <Layout
      currentView={currentView}
      onViewChange={setCurrentView}
      onHistoryToggle={() => setIsHistoryOpen(!isHistoryOpen)}
      onHistoryClose={() => setIsHistoryOpen(false)}
      isHistoryOpen={isHistoryOpen}
      currentTranscript={transcript}
      onSelectTranscription={handleSelectTranscription}
    >

      {/* Proxy status indicators - fixed top right */}
      <div
        style={{
          position: 'fixed',
          top: spacing.md,
          right: spacing.md,
          display: 'flex',
          gap: '6px',
          fontSize: typography.fontSize.xs,
          color: colors.text.tertiary,
          zIndex: 3
        }}
      >
        {proxyStatusEntries.map(([name, status]) => (
          <div
            key={name}
            style={{
              ...components.proxyIndicator.container,
              display: 'flex',
              gap: spacing.md,
              alignItems: 'center'
            }}
            title={`${name}: ${status}`}
          >
            <span
              style={{
                fontSize: typography.fontSize.xs,
                opacity: 0.8,
                fontWeight: typography.fontWeight.medium
              }}
            >
              {name}
            </span>
            <div
              style={{
                ...components.proxyIndicator.dot,
                backgroundColor: getStatusColor(status),
                border:
                  status === 'loading'
                    ? '1px solid rgba(255, 255, 255, 0.3)'
                    : 'none',
                boxShadow: status === 'loading' ? 'inset 0 0 2px rgba(0, 0, 0, 0.3)' : 'none'
              }}
            />
          </div>
        ))}
      </div>

      {/* Render Statistics or Home content based on current view */}
      {currentView === 'statistics' ? (
        <Statistics />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1
          }}
        >
          <div
            style={{
              padding: '20px',
              maxWidth: '600px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
        <button
          type="button"
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          disabled={isLoading}
          aria-label={isRecording ? 'Recording...' : 'Start recording'}
          style={
            {
              ...components.button.record,
              backgroundColor: getRecordButtonColor(isRecording, isLoading),
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              WebkitAppRegion: 'no-drag'
            } as React.CSSProperties
          }
        >
          {isRecording ? (
            <Mic />
          ) : isLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <MicOff />
          )}
        </button>

        <div
          style={
            {
              transition: 'opacity 0.3s',
              opacity: transcript ? 1 : 0,
              marginTop: spacing.xl,
              padding: spacing.lg,
              backgroundColor: colors.background.secondary,
              borderRadius: borderRadius.lg,
              border: `1px solid ${colors.border.primary}`,
              color: colors.text.primary,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'start',
              gap: spacing.md,
              maxHeight: '70vh',
              overflowY: 'auto',
              WebkitAppRegion: 'no-drag'
            } as React.CSSProperties
          }
        >
          <h3
            style={{
              fontSize: typography.fontSize.xs,
              color: colors.text.tertiary,
              margin: 0
            }}
          >
            Transcription (copied to clipboard):
          </h3>

          <p
            ref={transcriptRef}
            onClick={handleCopyTranscript}
            role="button"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCopyTranscript();
              }
            }}
            style={{
              ...components.input.base,
              alignSelf: 'stretch',
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            {transcript}
          </p>

          {/* Audio waveform visualization */}
          {audioAmplitudes.length > 0 && (
            <div style={{ marginTop: spacing.md, alignSelf: 'stretch' }}>
              <AudioWaveform
                amplitudes={audioAmplitudes}
                duration={audioDuration}
                showDuration={true}
                height={60}
              />
            </div>
          )}
        </div>
      </div>
        </div>
      )}
    </Layout>
  );
};

export default HomePage;
