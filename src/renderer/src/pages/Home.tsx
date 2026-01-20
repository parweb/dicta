import { AlertCircle } from 'lucide-react';
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';

import BedrockAgentDrawer from '@/components/bedrock/BedrockAgentDrawer';
import TimelineTranscriptList from '@/components/timeline/TimelineTranscriptList';
import RecordButton from '@/components/home/RecordButton';
import ProxyStatusIndicators from '@/components/home/ProxyStatusIndicators';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useTranscriptionAPI } from '@/hooks/useTranscriptionAPI';
import { useTranscriptionNavigation } from '@/hooks/useTranscriptionNavigation';
import { useApiKey } from '@/lib/api-key-context';
import type { Transcription } from '@/lib/history';
import { useTheme } from '@/lib/theme-context';

// Lazy load Statistics and Settings pages to reduce initial bundle size
const Statistics = lazy(() => import('./Statistics'));
const Settings = lazy(() => import('./Settings'));

const HomePage = () => {
  const [transcript, setTranscript] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerFollowUpTranscript, setDrawerFollowUpTranscript] = useState<string | undefined>(undefined);
  const [currentView, setCurrentView] = useState<
    'home' | 'statistics' | 'settings'
  >('home');
  const [settingsTab, setSettingsTab] = useState<'theme' | 'model'>('theme');

  const hasRedirectedRef = useRef(false);

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
    navigateTranscription,
    setCurrentTranscriptionId,
    reloadTranscriptions
  } = useTranscriptionNavigation();

  const { transcribeAudio, proxyStatuses, isLoading, analyzeAudio } =
    useTranscriptionAPI(apiKey, reloadTranscriptions);

  // Wrapper functions to handle view changes and transcription flow
  const startRecording = useCallback(async () => {
    console.log('[HOME] ========== STARTING RECORDING ==========');

    // Switch to home view and close sidebar when starting recording (unless drawer is open)
    if (!isDrawerOpen) {
      setCurrentView('home');
      setIsHistoryOpen(false);
    }

    await startAudioRecording(async audioBlob => {
      console.log('[HOME] Audio recorded, blob size:', audioBlob.size, 'type:', audioBlob.type);

      // Analyze audio
      const { durationMs, amplitudes } = await analyzeAudio(audioBlob);
      console.log('[HOME] Audio analyzed, duration:', durationMs, 'ms');

      // Transcribe and get the result
      console.log('[HOME] Starting transcription with API key length:', apiKey?.length);
      const result = await transcribeAudio(audioBlob, durationMs, amplitudes);
      console.log('[HOME] Transcription result:', result);

      if (result.text) {
        // If drawer is open, send transcription to drawer as follow-up
        if (isDrawerOpen) {
          console.log('[HOME] Drawer is open, sending transcription as follow-up');
          setDrawerFollowUpTranscript(result.text);
        } else {
          // Normal flow: transcription saved and list will auto-update
          setTranscript(result.text);
        }
      }
    });
  }, [
    startAudioRecording,
    analyzeAudio,
    transcribeAudio,
    apiKey,
    isDrawerOpen
  ]);

  const stopRecording = useCallback(() => {
    stopAudioRecording();
  }, [stopAudioRecording]);

  // Use keyboard shortcuts hook
  useKeyboardShortcuts({
    isRecording,
    isHistoryOpen,
    currentView,
    startRecording,
    stopRecording,
    onNavigate: navigateTranscription
  });

  // Auto-redirect to settings if no API key on initial mount
  useEffect(() => {
    if (!isApiKeyLoading && !hasApiKey && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      setCurrentView('settings');
      setSettingsTab('model');
    }
  }, [isApiKeyLoading, hasApiKey]);

  // Calculate whether to show API key banner
  const showApiKeyBanner = !isApiKeyLoading && !hasApiKey && currentView === 'home' && hasRedirectedRef.current;

  const handleCopyTranscript = useCallback((transcription: Transcription) => {
    navigator.clipboard.writeText(transcription.text);
  }, []);

  const handleOpenActions = useCallback((transcription: Transcription) => {
    setTranscript(transcription.text);
    setIsDrawerOpen(true);
  }, []);

  const handleSelectTranscription = useCallback(
    (transcription: Transcription) => {
      setTranscript(transcription.text);
      setCurrentTranscriptionId(transcription.id);
      setIsHistoryOpen(false);
      setCurrentView('home');
    },
    [setCurrentTranscriptionId]
  );

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

      <Suspense
        fallback={
          <div className="text-muted-foreground flex h-full items-center justify-center">
            Loading...
          </div>
        }
      >
        {currentView === 'statistics' ? (
          <Statistics />
        ) : currentView === 'settings' ? (
          <Settings defaultTab={settingsTab} />
        ) : showApiKeyBanner ? (
          <div
            style={{
              width: '100%',
              height: '100vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative'
            }}
          >
            <div
              style={{
                ...theme.components.card.base,
                padding: theme.spacing.md,
                backgroundColor: '#ffffff',
                borderLeft: `4px solid ${theme.colors.accent.yellow}`,
                maxWidth: '500px',
                WebkitAppRegion: 'no-drag'
              } as React.CSSProperties}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'start',
                  gap: theme.spacing.sm
                }}
              >
                <AlertCircle size={18} />
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
                    Ajoutez votre clé OpenAI pour utiliser la transcription
                    vocale
                  </p>
                  <Button
                    onClick={() => {
                      setCurrentView('settings');
                      setSettingsTab('model');
                    }}
                    size="sm"
                  >
                    Configurer maintenant
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              width: '100%',
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              paddingTop: theme.spacing['4xl']
            }}
          >
            {/* Timeline List */}
            <TimelineTranscriptList
              transcriptions={allTranscriptions}
              onCopyTranscript={handleCopyTranscript}
              onOpenActions={handleOpenActions}
            />

            {/* Fixed Record Button at Bottom */}
            <div
              style={{
                padding: theme.spacing.xl,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: theme.colors.background.primary,
                borderTop: `1px solid ${theme.colors.border.primary}`
              }}
            >
              <RecordButton
                isRecording={isRecording}
                isLoading={isLoading}
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
              />
            </div>
          </div>
        )}
      </Suspense>

      {/* Bedrock Agent Drawer */}
      <BedrockAgentDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        transcriptContext={transcript}
        newTranscript={drawerFollowUpTranscript}
        onTranscriptConsumed={() => setDrawerFollowUpTranscript(undefined)}
      />
    </Layout>
  );
};

export default HomePage;
