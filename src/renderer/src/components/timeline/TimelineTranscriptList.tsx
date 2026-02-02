import type { ConversationHistory } from '@/hooks/useBedrockAgent';
import type { Transcription } from '@/lib/history';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useMemo, useRef, useState } from 'react';
import SimpleScrollbar from './SimpleScrollbar';
import './TimelineTranscriptList.css';
import TranscriptionMessage from './TranscriptionMessage';

interface TimelineTranscriptListProps {
  transcriptions: Transcription[];
  currentTranscriptionId?: string | null;
  activeActionsTranscriptionId?: string | null;
  actionsFollowUpTranscript?: string;
  isRecording?: boolean;
  isLoading?: boolean;
  realtimeAmplitudes?: number[];
  onCopyTranscript?: (transcription: Transcription) => void;
  onOpenActions?: (transcription: Transcription) => void;
  onCloseActions?: () => void;
  onFollowUpConsumed?: () => void;
  onFollowUpFocusChange?: (isFocused: boolean) => void;
  onBedrockHistoryChange?: (
    transcriptionId: string,
    history: ConversationHistory
  ) => void;
}

export default function TimelineTranscriptList({
  transcriptions,
  currentTranscriptionId,
  activeActionsTranscriptionId,
  actionsFollowUpTranscript,
  isRecording = false,
  isLoading = false,
  realtimeAmplitudes = [],
  onCopyTranscript,
  onOpenActions,
  onCloseActions,
  onFollowUpConsumed,
  onFollowUpFocusChange,
  onBedrockHistoryChange
}: TimelineTranscriptListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(transcriptions.length - 1);
  const [scrollProgress, setScrollProgress] = useState(1);

  // Timer for recording duration
  const recordingStartTimeRef = useRef<number>(Date.now());
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Save amplitudes when recording stops to keep them during loading
  const [savedAmplitudes, setSavedAmplitudes] = useState<number[]>([]);

  // Track the last transcription count to detect when new one is added
  const lastTranscriptionCountRef = useRef(transcriptions.length);
  const [shouldShowPlaceholder, setShouldShowPlaceholder] = useState(false);

  // Virtualize the list for performance
  const virtualizer = useVirtualizer({
    count: transcriptions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 180,
    overscan: 5,
    measureElement: el => el?.getBoundingClientRect().height ?? 180
  });

  // Show placeholder when recording or loading starts
  useEffect(() => {
    if (isRecording || isLoading) {
      setShouldShowPlaceholder(true);
    }
  }, [isRecording, isLoading]);

  // Hide placeholder when new transcription is added and scroll to it
  useEffect(() => {
    if (transcriptions.length > lastTranscriptionCountRef.current) {
      setShouldShowPlaceholder(false);
      lastTranscriptionCountRef.current = transcriptions.length;

      // Scroll to the new transcription using virtualizer
      const newIndex = transcriptions.length - 1;
      requestAnimationFrame(() => {
        virtualizer.scrollToIndex(newIndex, {
          align: 'end',
          behavior: 'smooth'
        });
      });
    }
  }, [transcriptions.length, virtualizer]);

  // Reset start time when recording starts
  useEffect(() => {
    if (isRecording) {
      recordingStartTimeRef.current = Date.now();
      setRecordingDuration(0);
      setSavedAmplitudes([]); // Clear saved amplitudes when starting new recording
      lastTranscriptionCountRef.current = transcriptions.length; // Update count reference
    }
  }, [isRecording, transcriptions.length]);

  // Update recording duration while recording
  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(() => {
      setRecordingDuration(Date.now() - recordingStartTimeRef.current);
    }, 100);

    return () => clearInterval(interval);
  }, [isRecording]);

  // Save amplitudes when recording stops
  useEffect(() => {
    if (!isRecording && realtimeAmplitudes.length > 0) {
      setSavedAmplitudes(realtimeAmplitudes);
    }
  }, [isRecording, realtimeAmplitudes]);

  // Create temporary transcription object during recording/loading
  const temporaryTranscription = useMemo<Transcription | null>(() => {
    if (!shouldShowPlaceholder) return null;

    // Use savedAmplitudes during loading, realtimeAmplitudes during recording
    const amplitudes = isLoading ? savedAmplitudes : realtimeAmplitudes;

    return {
      id: 'temp-recording',
      text: '', // Empty during recording, will show loader during loading
      timestamp: recordingStartTimeRef.current,
      durationMs: recordingDuration,
      audioAmplitudes: amplitudes
    };
  }, [
    shouldShowPlaceholder,
    isRecording,
    isLoading,
    recordingDuration,
    realtimeAmplitudes,
    savedAmplitudes
  ]);

  // Auto-scroll to bottom when new transcriptions added
  useEffect(() => {
    if (transcriptions.length > 0) {
      setCurrentIndex(transcriptions.length - 1);
      virtualizer.scrollToIndex(transcriptions.length - 1, {
        align: 'end',
        behavior: 'auto'
      });
    }
  }, [transcriptions.length, virtualizer]);

  // Auto-scroll to bottom when recording starts (to show placeholder)
  useEffect(() => {
    if (shouldShowPlaceholder && parentRef.current) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        if (parentRef.current) {
          parentRef.current.scrollTo({
            top: parentRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      });
    }
  }, [shouldShowPlaceholder]);

  // Continuous scroll during recording/loading as content grows
  useEffect(() => {
    if (!shouldShowPlaceholder || !parentRef.current) return;

    const scrollToBottom = () => {
      if (parentRef.current) {
        parentRef.current.scrollTop = parentRef.current.scrollHeight;
      }
    };

    // Scroll every time amplitudes change (content grows) or when transitioning to loading
    scrollToBottom();
  }, [
    shouldShowPlaceholder,
    isRecording,
    isLoading,
    realtimeAmplitudes.length,
    savedAmplitudes.length
  ]);

  // Update current index and scroll progress based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollElement = parentRef.current;
      if (!scrollElement) return;

      // Calculate scroll progress
      const maxScroll = scrollElement.scrollHeight - scrollElement.clientHeight;
      const progress = maxScroll > 0 ? scrollElement.scrollTop / maxScroll : 0;
      setScrollProgress(progress);

      // Find the item closest to the middle of the viewport
      const items = virtualizer.getVirtualItems();
      if (items.length > 0) {
        const viewportMiddle =
          scrollElement.scrollTop + scrollElement.clientHeight / 2;
        let closestIndex = 0;
        let closestDistance = Infinity;

        items.forEach(item => {
          const itemMiddle = item.start + item.size / 2;
          const distance = Math.abs(itemMiddle - viewportMiddle);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = item.index;
          }
        });

        setCurrentIndex(closestIndex);
      }
    };

    const scrollElement = parentRef.current;
    scrollElement?.addEventListener('scroll', handleScroll, { passive: true });

    // Initial calculation
    handleScroll();

    return () => scrollElement?.removeEventListener('scroll', handleScroll);
  }, [virtualizer]);

  // Handle scroll from timeline drag
  const handleTimelineScroll = (progress: number) => {
    const scrollElement = parentRef.current;
    if (!scrollElement) return;

    const maxScroll = scrollElement.scrollHeight - scrollElement.clientHeight;
    scrollElement.scrollTop = progress * maxScroll;
  };

  return (
    <div className="timeline-transcript-list align-center flex flex-1 gap-5 self-stretch">
      <div ref={parentRef} className="timeline-scroll-container flex-1">
        {transcriptions.length === 0 && !shouldShowPlaceholder ? (
          <div className="timeline-empty-state">
            <div className="empty-icon">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19 10v2a7 7 0 0 1-14 0v-2"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="12"
                  y1="19"
                  x2="12"
                  y2="22"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h3 className="empty-title">Prêt à transcrire</h3>
            <p className="empty-description">
              Maintenez la touche <kbd className="kbd-key">X</kbd> enfoncée pour
              commencer l'enregistrement
            </p>
            <div className="empty-hint">
              <span className="hint-dot" />
              <span>
                Ou utilisez le raccourci global <kbd className="kbd-key">⌘</kbd>{' '}
                + <kbd className="kbd-key">⇧</kbd> +{' '}
                <kbd className="kbd-key">X</kbd>
              </span>
            </div>
          </div>
        ) : (
          <div
            style={{
              height: `${Math.max(virtualizer.getTotalSize(), shouldShowPlaceholder ? 200 : 0)}px`,
              width: '100%',
              position: 'relative'
            }}
          >
            {virtualizer.getVirtualItems().map(virtualItem => {
              const transcription = transcriptions[virtualItem.index];
              const isSelected = currentTranscriptionId === transcription.id;
              const showActions =
                activeActionsTranscriptionId === transcription.id;
              return (
                <div
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualItem.start}px)`,
                    willChange: 'transform'
                  }}
                >
                  <TranscriptionMessage
                    textContent={
                      <p className="message-text">{transcription.text}</p>
                    }
                    transcriptText={transcription.text}
                    audioAmplitudes={transcription.audioAmplitudes}
                    audioDuration={transcription.durationMs}
                    timestamp={transcription.timestamp}
                    isSelected={isSelected}
                    showActions={showActions}
                    newFollowUpTranscript={
                      showActions ? actionsFollowUpTranscript : undefined
                    }
                    onCopy={() => onCopyTranscript?.(transcription)}
                    onOpenActions={() => onOpenActions?.(transcription)}
                    onCloseActions={onCloseActions}
                    onFollowUpConsumed={onFollowUpConsumed}
                    onFollowUpFocusChange={
                      showActions ? onFollowUpFocusChange : undefined
                    }
                    bedrockHistory={transcription.bedrockHistory}
                    onBedrockHistoryChange={history =>
                      onBedrockHistoryChange?.(transcription.id, history)
                    }
                  />
                </div>
              );
            })}

            {/* Temporary transcription during recording/loading */}
            {temporaryTranscription && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualizer.getTotalSize()}px)`,
                  padding: '16px 0'
                }}
              >
                <TranscriptionMessage
                  textContent={
                    isLoading ? (
                      <div className="message-loader">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="loader-spin"
                        >
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        <span className="loader-text">
                          Transcription en cours...
                        </span>
                      </div>
                    ) : null
                  }
                  transcriptText={undefined}
                  audioAmplitudes={temporaryTranscription.audioAmplitudes}
                  audioDuration={temporaryTranscription.durationMs}
                  timestamp={temporaryTranscription.timestamp}
                  waveformColor={
                    isRecording || isLoading ? '#ef4444' : undefined
                  }
                  waveformMaxBars={isRecording || isLoading ? 200 : 60}
                  isSelected={false}
                  showActions={false}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {transcriptions.length > 0 && (
        <SimpleScrollbar
          scrollProgress={scrollProgress}
          onScroll={handleTimelineScroll}
          itemCount={transcriptions.length}
          currentIndex={currentIndex}
        />
      )}
    </div>
  );
}
