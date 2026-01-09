import { Loader2, Mic, MicOff } from 'lucide-react';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

import AudioWaveform from '../components/AudioWaveform';
import Layout from '../components/Layout';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useTranscriptionAPI } from '../hooks/useTranscriptionAPI';
import { useTranscriptionNavigation } from '../hooks/useTranscriptionNavigation';
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

const HomePage = () => {
  const [transcript, setTranscript] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'statistics'>('home');
  const [audioAmplitudes, setAudioAmplitudes] = useState<number[]>([]);
  const [audioDuration, setAudioDuration] = useState<number | undefined>(undefined);

  const transcriptRef = useRef<HTMLParagraphElement | null>(null);

  // Use custom hooks
  const { isRecording, startRecording: startAudioRecording, stopRecording: stopAudioRecording } = useAudioRecorder();

  const {
    allTranscriptions,
    currentTranscriptionId,
    slideDirection,
    navigateTranscription,
    setCurrentTranscriptionId,
    reloadTranscriptions
  } = useTranscriptionNavigation();

  const {
    transcribeAudio,
    proxyStatuses,
    isLoading,
    analyzeAudio
  } = useTranscriptionAPI(reloadTranscriptions);

  // Wrapper functions to handle view changes and transcription flow
  const startRecording = useCallback(async () => {
    // Switch to home view and close sidebar when starting recording
    setCurrentView('home');
    setIsHistoryOpen(false);

    await startAudioRecording(async (audioBlob) => {
      // Analyze audio
      const { durationMs, amplitudes } = await analyzeAudio(audioBlob);
      setAudioDuration(durationMs);
      setAudioAmplitudes(amplitudes);

      // Transcribe and get the text
      const text = await transcribeAudio(audioBlob, durationMs, amplitudes);
      if (text) {
        setTranscript(text);
        // The transcription ID is set by the useTranscriptionAPI hook via reloadTranscriptions
        // We need to manually set it after save
        const result = await window.api?.history.loadAll();
        if (result?.success && result.transcriptions) {
          const transcriptions = result.transcriptions as Transcription[];
          transcriptions.sort((a, b) => b.timestamp - a.timestamp);
          if (transcriptions.length > 0) {
            setCurrentTranscriptionId(transcriptions[0].id);
          }
        }
      }
    });
  }, [startAudioRecording, analyzeAudio, transcribeAudio, setCurrentTranscriptionId]);

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
    setAudioDuration(transcription.durationMs);
    setCurrentTranscriptionId(transcription.id);
    setIsHistoryOpen(false);
    setCurrentView('home');
  }, [setCurrentTranscriptionId]);

  // Update transcript when navigation changes currentTranscriptionId
  useEffect(() => {
    if (currentTranscriptionId && allTranscriptions.length > 0) {
      const transcription = allTranscriptions.find(t => t.id === currentTranscriptionId);
      if (transcription) {
        setTranscript(transcription.text);
        setAudioAmplitudes(transcription.audioAmplitudes || []);
        setAudioDuration(transcription.durationMs);
      }
    }
  }, [currentTranscriptionId, allTranscriptions]);

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
              transition: 'opacity 0.3s, transform 0.3s ease-out',
              opacity: transcript ? 1 : 0,
              transform: slideDirection === 'up'
                ? 'translateY(-20px)'
                : slideDirection === 'down'
                ? 'translateY(20px)'
                : 'translateY(0)',
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
                maxBars={100}
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
