import { useState, useRef, useEffect, useCallback, lazy, Suspense } from 'react';
import { AlertCircle } from 'lucide-react';

import HomeContent from '../components/home/HomeContent';
import ProxyStatusIndicators from '../components/home/ProxyStatusIndicators';
import Layout from '../components/Layout';
import { useApiKey } from '../lib/api-key-context';
import { useTheme } from '../lib/theme-context';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useTranscriptionAPI } from '../hooks/useTranscriptionAPI';
import { useTranscriptionNavigation } from '../hooks/useTranscriptionNavigation';
import type { Transcription } from '../lib/history';

// Lazy load Statistics and Settings pages to reduce initial bundle size
const Statistics = lazy(() => import('./Statistics'));
const Settings = lazy(() => import('./Settings'));

const HomePage = () => {
  const [transcript, setTranscript] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentView, setCurrentView] = useState<
    'home' | 'statistics' | 'settings'
  >('home');
  const [settingsTab, setSettingsTab] = useState<'theme' | 'model'>('theme');
  const [showApiKeyBanner, setShowApiKeyBanner] = useState(false);
  const [audioAmplitudes, setAudioAmplitudes] = useState<number[]>([]);
  const [audioDuration, setAudioDuration] = useState<number | undefined>(
    undefined
  );
  const [transcriptionError, setTranscriptionError] = useState<
    string | undefined
  >(undefined);
  const [failedAudioBlob, setFailedAudioBlob] = useState<Blob | undefined>(
    undefined
  );

  const transcriptRef = useRef<HTMLParagraphElement | null>(null);

  // Use theme and API key hooks
  const { theme } = useTheme();
  const { apiKey, hasApiKey, isLoading: isApiKeyLoading } = useApiKey();

  // Use custom hooks
  const {
    isRecording,
    startRecording: startAudioRecording,
    stopRecording: stopAudioRecording
  } = useAudioRecorder();

  const {
    allTranscriptions,
    currentTranscriptionId,
    slideDirection,
    navigateTranscription,
    setCurrentTranscriptionId,
    reloadTranscriptions
  } = useTranscriptionNavigation();

  const { transcribeAudio, proxyStatuses, isLoading, analyzeAudio } =
    useTranscriptionAPI(apiKey, reloadTranscriptions);

  // Wrapper functions to handle view changes and transcription flow
  const startRecording = useCallback(async () => {
    // Switch to home view and close sidebar when starting recording
    setCurrentView('home');
    setIsHistoryOpen(false);
    // Clear any previous error and failed audio
    setTranscriptionError(undefined);
    setFailedAudioBlob(undefined);

    await startAudioRecording(async audioBlob => {
      // Analyze audio
      const { durationMs, amplitudes } = await analyzeAudio(audioBlob);
      setAudioDuration(durationMs);
      setAudioAmplitudes(amplitudes);

      // Transcribe and get the result
      const result = await transcribeAudio(audioBlob, durationMs, amplitudes);
      if (result.text) {
        setTranscript(result.text);
        setTranscriptionError(undefined);
        setFailedAudioBlob(undefined);
        // The transcription ID is set by the useTranscriptionAPI hook via reloadTranscriptions
        // We need to manually set it after save
        const historyResult = await window.api?.history.loadAll();
        if (historyResult?.success && historyResult.transcriptions) {
          const transcriptions =
            historyResult.transcriptions as Transcription[];
          transcriptions.sort((a, b) => b.timestamp - a.timestamp);
          if (transcriptions.length > 0) {
            setCurrentTranscriptionId(transcriptions[0].id);
          }
        }
      } else if (result.error) {
        // Store the error and audio blob for retry
        setTranscriptionError(result.error);
        setFailedAudioBlob(audioBlob);
      }
    });
  }, [
    startAudioRecording,
    analyzeAudio,
    transcribeAudio,
    setCurrentTranscriptionId
  ]);

  const stopRecording = useCallback(() => {
    stopAudioRecording();
  }, [stopAudioRecording]);

  const retryTranscription = useCallback(async () => {
    if (!failedAudioBlob) return;

    // Clear the error while retrying
    setTranscriptionError(undefined);

    // Retry the transcription with the stored audio blob
    const result = await transcribeAudio(
      failedAudioBlob,
      audioDuration,
      audioAmplitudes
    );
    if (result.text) {
      setTranscript(result.text);
      setTranscriptionError(undefined);
      setFailedAudioBlob(undefined);
      // Load the updated history
      const historyResult = await window.api?.history.loadAll();
      if (historyResult?.success && historyResult.transcriptions) {
        const transcriptions = historyResult.transcriptions as Transcription[];
        transcriptions.sort((a, b) => b.timestamp - a.timestamp);
        if (transcriptions.length > 0) {
          setCurrentTranscriptionId(transcriptions[0].id);
        }
      }
    } else if (result.error) {
      // Set the error again if retry failed
      setTranscriptionError(result.error);
    }
  }, [
    failedAudioBlob,
    audioDuration,
    audioAmplitudes,
    transcribeAudio,
    setCurrentTranscriptionId
  ]);

  // Use keyboard shortcuts hook
  useKeyboardShortcuts({
    isRecording,
    isHistoryOpen,
    currentView,
    startRecording,
    stopRecording,
    onNavigate: navigateTranscription
  });

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

  // Check API key and show banner if missing
  useEffect(() => {
    if (!isApiKeyLoading && !hasApiKey) {
      setShowApiKeyBanner(true);
    } else {
      setShowApiKeyBanner(false);
    }
  }, [isApiKeyLoading, hasApiKey]);

  const handleCopyTranscript = useCallback(() => {
    if (transcript) {
      navigator.clipboard.writeText(transcript);
    }
  }, [transcript]);

  const handleSelectTranscription = useCallback(
    (transcription: Transcription) => {
      setTranscript(transcription.text);
      setAudioAmplitudes(transcription.audioAmplitudes || []);
      setAudioDuration(transcription.durationMs);
      setCurrentTranscriptionId(transcription.id);
      setIsHistoryOpen(false);
      setCurrentView('home');
    },
    [setCurrentTranscriptionId]
  );

  // Update transcript when navigation changes currentTranscriptionId
  useEffect(() => {
    if (currentTranscriptionId && allTranscriptions.length > 0) {
      const transcription = allTranscriptions.find(
        t => t.id === currentTranscriptionId
      );
      if (transcription) {
        setTranscript(transcription.text);
        setAudioAmplitudes(transcription.audioAmplitudes || []);
        setAudioDuration(transcription.durationMs);
      }
    }
  }, [currentTranscriptionId, allTranscriptions]);

  return (
    <Layout
      currentView={currentView}
      onViewChange={value =>
        setCurrentView(value === currentView ? 'home' : value)
      }
      onHistoryToggle={() => setIsHistoryOpen(!isHistoryOpen)}
      onHistoryClose={() => setIsHistoryOpen(false)}
      isHistoryOpen={isHistoryOpen}
      currentTranscript={transcript}
      onSelectTranscription={handleSelectTranscription}
    >
      <ProxyStatusIndicators proxyStatuses={proxyStatuses} />

      {/* API Key Missing Banner */}
      {showApiKeyBanner && currentView === 'home' && (
        <div
          style={{
            position: 'absolute',
            top: theme.spacing['4xl'],
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            ...theme.components.card.base,
            padding: theme.spacing.md,
            backgroundColor: '#ffffff',
            borderLeft: `4px solid ${theme.colors.accent.yellow}`,
            maxWidth: '500px',
            width: 'calc(100% - 32px)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'start',
              gap: theme.spacing.sm
            }}
          >
            <AlertCircle size={18} color={theme.colors.accent.yellow} />
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: '#000000',
                  marginBottom: theme.spacing.xs
                }}
              >
                Clé API non configurée
              </p>
              <p
                style={{
                  fontSize: theme.typography.fontSize.xs,
                  color: '#666666',
                  marginBottom: theme.spacing.sm
                }}
              >
                Ajoutez votre clé OpenAI pour utiliser la transcription vocale
              </p>
              <button
                onClick={() => {
                  setCurrentView('settings');
                  setSettingsTab('model');
                  setShowApiKeyBanner(false);
                }}
                style={{
                  ...theme.components.button.base,
                  fontSize: theme.typography.fontSize.xs,
                  padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`
                }}
              >
                Configurer maintenant
              </button>
            </div>
          </div>
        </div>
      )}

      <Suspense fallback={<div className="flex items-center justify-center h-full text-muted-foreground">Loading...</div>}>
        {currentView === 'statistics' ? (
          <Statistics />
        ) : currentView === 'settings' ? (
          <Settings defaultTab={settingsTab} />
        ) : (
          <HomeContent
            isRecording={isRecording}
            isLoading={isLoading}
            transcript={transcript}
            transcriptRef={transcriptRef}
            slideDirection={slideDirection}
            audioAmplitudes={audioAmplitudes}
            audioDuration={audioDuration}
            startRecording={startRecording}
            stopRecording={stopRecording}
            onCopyTranscript={handleCopyTranscript}
            transcriptionError={transcriptionError}
            failedAudioBlob={failedAudioBlob}
            onRetry={retryTranscription}
          />
        )}
      </Suspense>
    </Layout>
  );
};

export default HomePage;
