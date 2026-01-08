import { BarChart3, History, Loader2, Mic, MicOff } from 'lucide-react';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

import HistorySidebar from '../components/HistorySidebar';
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

  // Save transcription to history
  const saveToHistory = useCallback(async (text: string) => {
    try {
      const transcription: Transcription = {
        id: `${Date.now()}`,
        text,
        timestamp: Date.now()
      };
      await window.api?.history.save(transcription);
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  }, []);

  const transcribeAudio = useCallback(
    async (blob: Blob) => {
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
        await saveToHistory(data.text);
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
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
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
  }, [transcribeAudio]);

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

  const getStatusColor = useCallback((status: ProxyStatus): string => {
    switch (status) {
      case 'success':
        return '#4ade80'; // vert
      case 'error':
        return '#ef4444'; // rouge
      case 'cancelled':
        return '#9ca3af'; // gris
      case 'loading':
        return '#ffffff'; // blanc
      default:
        return '#d1d5db'; // gris clair
    }
  }, []);

  const handleCopyTranscript = useCallback(() => {
    if (transcript) {
      navigator.clipboard.writeText(transcript);
    }
  }, [transcript]);

  const handleSelectTranscription = useCallback((text: string) => {
    setTranscript(text);
    setIsHistoryOpen(false);
  }, []);

  const proxyStatusEntries = useMemo(
    () => Object.entries(proxyStatuses),
    [proxyStatuses]
  );

  // If statistics view is active, render Statistics component
  if (currentView === 'statistics') {
    return <Statistics onBack={() => setCurrentView('home')} />;
  }

  // Otherwise render Home view
  return (
    <>
      {/* Draggable area - entire window */}
      <div
        style={
          {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            WebkitAppRegion: 'drag'
          } as React.CSSProperties
        }
      />

      {/* Top left buttons */}
      <div
        style={{
          position: 'fixed',
          top: '12px',
          left: '12px',
          zIndex: 1000,
          display: 'flex',
          gap: '8px',
          WebkitAppRegion: 'no-drag'
        }}
      >
        {/* History toggle button */}
        <button
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          style={
            {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer'
            } as React.CSSProperties
          }
          title="Historique"
        >
          <History size={18} color="#ffffff" />
        </button>

        {/* Statistics button */}
        <button
          onClick={() => setCurrentView('statistics')}
          style={
            {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer'
            } as React.CSSProperties
          }
          title="Statistiques"
        >
          <BarChart3 size={18} color="#ffffff" />
        </button>
      </div>

      {/* History Sidebar */}
      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectTranscription={handleSelectTranscription}
        currentTranscript={transcript}
      />

      {/* Proxy status indicators - fixed top right */}
      <div
        style={{
          position: 'fixed',
          top: '12px',
          right: '12px',
          display: 'flex',
          gap: '6px',
          fontSize: '9px',
          color: '#9ca3af',
          zIndex: 1000
        }}
      >
        {proxyStatusEntries.map(([name, status]) => (
          <div
            key={name}
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              padding: '3px 6px',
              color: '#e5e7eb',
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              backdropFilter: 'blur(4px)',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
            }}
            title={`${name}: ${status}`}
          >
            <span style={{ fontSize: '8px', opacity: 0.8, fontWeight: 500 }}>
              {name}
            </span>
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: getStatusColor(status),
                border:
                  status === 'loading'
                    ? '1px solid rgba(255, 255, 255, 0.3)'
                    : 'none',
                boxShadow:
                  status === 'loading'
                    ? 'inset 0 0 2px rgba(0, 0, 0, 0.3)'
                    : 'none'
              }}
            />
          </div>
        ))}
      </div>

      {/* Background */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#0f172a',
          zIndex: 0
        }}
      />

      <div
        style={{
          padding: '20px',
          maxWidth: '600px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh'
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
              padding: '15px 30px',
              fontSize: '18px',
              backgroundColor: isRecording
                ? '#ff4444'
                : isLoading
                  ? '#9ca3af'
                  : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s',
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
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#1e293b',
              borderRadius: '8px',
              border: '1px solid #334155',
              color: '#f9fafb',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'start',
              gap: '10px',
              WebkitAppRegion: 'no-drag'
            } as React.CSSProperties
          }
        >
          <h3 style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>
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
              flex: 1,
              alignSelf: 'stretch',
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              padding: '10px',
              borderRadius: '5px',
              cursor: 'pointer',
              margin: 0,
              color: '#e5e7eb'
            }}
          >
            {transcript}
          </p>
        </div>
      </div>
    </>
  );
};

export default HomePage;
