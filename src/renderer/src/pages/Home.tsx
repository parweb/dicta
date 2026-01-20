import { AlertCircle } from 'lucide-react';
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';

import AnimatedView, { OverlayPanels } from '@/components/AnimatedView';
import BedrockAgentDrawer from '@/components/bedrock/BedrockAgentDrawer';
import TimelineTranscriptList from '@/components/timeline/TimelineTranscriptList';
import RecordButton from '@/components/home/RecordButton';
import ProxyStatusIndicators from '@/components/home/ProxyStatusIndicators';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useNavigationStore } from '@/hooks/useNavigationStore';
import { useTranscriptionAPI } from '@/hooks/useTranscriptionAPI';
import { useTranscriptionNavigation } from '@/hooks/useTranscriptionNavigation';
import { useApiKeyStore } from '@/hooks/useApiKeyStore';
import type { Transcription } from '@/lib/history';
import { useThemeStore } from '@/hooks/useThemeStore';

// Lazy load Statistics and Settings pages to reduce initial bundle size
const Statistics = lazy(() => import('./Statistics'));
const Settings = lazy(() => import('./Settings'));

const HomePage = () => {
  const [transcript, setTranscript] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerFollowUpTranscript, setDrawerFollowUpTranscript] = useState<string | undefined>(undefined);

  const hasRedirectedRef = useRef(false);

  // Use navigation hook
  const { currentView, settingsTab, navigateTo } = useNavigationStore();

  // Use theme and API key hooks
  const { theme } = useThemeStore();
  const { apiKey, hasApiKey, isLoading: isApiKeyLoading } = useApiKeyStore();

  // Use custom hooks
  const {
    isRecording,
    startRecording: startAudioRecording,
    stopRecording: stopAudioRecording
  } = useAudioRecorder();

  const {
    allTranscriptions,
    currentTranscriptionId,
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
      navigateTo('home');
      setIsHistoryOpen(false);
    }

    await startAudioRecording(async audioBlob => {
      console.log('[HOME] Audio recorded, blob size:', audioBlob.size, 'type:', audioBlob.type);

      // Analyze audio
      const { durationMs, amplitudes } = await analyzeAudio(audioBlob);
      console.log('[HOME] Audio analyzed, duration:', durationMs, 'ms');

      // Transcribe and get the result
      console.log('[HOME] Starting transcription...');
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
          // Select the newly created transcription
          if (result.id) {
            setCurrentTranscriptionId(result.id);
          }
        }
      }
    });
  }, [
    startAudioRecording,
    analyzeAudio,
    transcribeAudio,
    isDrawerOpen,
    navigateTo,
    setCurrentTranscriptionId
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
      navigateTo('settings', 'model');
    }
  }, [isApiKeyLoading, hasApiKey, navigateTo]);

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
      navigateTo('home');
    },
    [setCurrentTranscriptionId, navigateTo]
  );

  return (
    <Layout
      currentView={currentView}
      onViewChange={value =>
        navigateTo(value === currentView ? 'home' : value)
      }
      onHistoryToggle={() => setIsHistoryOpen(!isHistoryOpen)}
      onHistoryClose={() => setIsHistoryOpen(false)}
      isHistoryOpen={isHistoryOpen}
      currentTranscript={transcript}
      onSelectTranscription={handleSelectTranscription}
    >
      <ProxyStatusIndicators proxyStatuses={proxyStatuses} />

      {/* Home view - always rendered */}
      <AnimatedView viewKey="home">
        {showApiKeyBanner ? (
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
                    onClick={() => navigateTo('settings', 'model')}
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
              currentTranscriptionId={currentTranscriptionId}
              onCopyTranscript={handleCopyTranscript}
              onOpenActions={handleOpenActions}
            />

            {/* Fixed Record Button at Bottom */}
            <div
              style={{
                padding: '40px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: theme.colors.background.primary,
                borderTop: `1px solid ${theme.colors.border.primary}`,
                position: 'relative',
                background: 'linear-gradient(180deg, rgba(15, 23, 42, 0) 0%, rgba(15, 23, 42, 0.8) 50%, rgba(15, 23, 42, 1) 100%)'
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
      </AnimatedView>

      {/* Overlay panels - Statistics and Settings */}
      <OverlayPanels currentView={currentView}>
        <Suspense fallback={null}>
          {currentView === 'statistics' && <Statistics />}
          {currentView === 'settings' && <Settings defaultTab={settingsTab} />}
        </Suspense>
      </OverlayPanels>

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
