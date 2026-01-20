/**
 * Timeline Transcript List Component - Voice Terminal Style
 * Displays transcriptions in a terminal-inspired layout with virtualization
 */

import { useEffect, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useThemeStore } from '@/hooks/useThemeStore';
import TranscriptionMessage from './TranscriptionMessage';
import RecordingPlaceholder from './RecordingPlaceholder';
import SimpleScrollbar from './SimpleScrollbar';
import type { Transcription } from '@/lib/history';
import type { ConversationHistory } from '@/hooks/useBedrockAgent';
import './TimelineTranscriptList.css';

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
  onBedrockHistoryChange?: (transcriptionId: string, history: ConversationHistory) => void;
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
  const { theme } = useThemeStore();
  const parentRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(transcriptions.length - 1);
  const [scrollProgress, setScrollProgress] = useState(1);

  // Virtualize the list for performance
  const virtualizer = useVirtualizer({
    count: transcriptions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 180,
    overscan: 5,
    measureElement: (el) => el?.getBoundingClientRect().height ?? 180
  });

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
    if ((isRecording || isLoading) && parentRef.current) {
      // Small delay to ensure placeholder is rendered
      setTimeout(() => {
        if (parentRef.current) {
          parentRef.current.scrollTop = parentRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [isRecording, isLoading]);

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
        const viewportMiddle = scrollElement.scrollTop + scrollElement.clientHeight / 2;
        let closestIndex = 0;
        let closestDistance = Infinity;

        items.forEach((item) => {
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
    <div className="timeline-transcript-list">
      {/* Simple Custom Scrollbar */}
      {transcriptions.length > 0 && (
        <SimpleScrollbar
          scrollProgress={scrollProgress}
          onScroll={handleTimelineScroll}
          itemCount={transcriptions.length}
          currentIndex={currentIndex}
        />
      )}

      {/* Scrollable content */}
      <div
        ref={parentRef}
        className="timeline-scroll-container"
        style={{
          paddingRight: transcriptions.length > 0 ? '72px' : '20px'
        }}
      >
        {transcriptions.length === 0 && !isRecording && !isLoading ? (
          <div className="timeline-empty-state">
            <div className="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="19" x2="12" y2="22" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="empty-title">Prêt à transcrire</h3>
            <p className="empty-description">
              Maintenez la touche <kbd className="kbd-key">X</kbd> enfoncée pour commencer l'enregistrement
            </p>
            <div className="empty-hint">
              <span className="hint-dot" />
              <span>Ou utilisez le raccourci global <kbd className="kbd-key">⌘</kbd> + <kbd className="kbd-key">⇧</kbd> + <kbd className="kbd-key">X</kbd></span>
            </div>
          </div>
        ) : (
          <div
            style={{
              height: `${Math.max(virtualizer.getTotalSize(), (isRecording || isLoading) ? 200 : 0)}px`,
              width: '100%',
              position: 'relative'
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const transcription = transcriptions[virtualItem.index];
              const isSelected = currentTranscriptionId === transcription.id;
              const showActions = activeActionsTranscriptionId === transcription.id;
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
                    text={transcription.text}
                    audioAmplitudes={transcription.audioAmplitudes}
                    audioDuration={transcription.durationMs}
                    timestamp={transcription.timestamp}
                    isSelected={isSelected}
                    showActions={showActions}
                    newFollowUpTranscript={showActions ? actionsFollowUpTranscript : undefined}
                    onCopy={() => onCopyTranscript?.(transcription)}
                    onOpenActions={() => onOpenActions?.(transcription)}
                    onCloseActions={onCloseActions}
                    onFollowUpConsumed={onFollowUpConsumed}
                    onFollowUpFocusChange={showActions ? onFollowUpFocusChange : undefined}
                    bedrockHistory={transcription.bedrockHistory}
                    onBedrockHistoryChange={(history) => onBedrockHistoryChange?.(transcription.id, history)}
                  />
                </div>
              );
            })}

            {/* Recording placeholder at the end */}
            {(isRecording || isLoading) && (
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
                <RecordingPlaceholder
                  amplitudes={realtimeAmplitudes}
                  isRecording={isRecording}
                  isLoading={isLoading}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
