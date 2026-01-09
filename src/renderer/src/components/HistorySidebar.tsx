import { useEffect } from 'react';

import TranscriptionGroup from './history/TranscriptionGroup';
import EmptyState from './shared/EmptyState';
import LoadingState from './shared/LoadingState';
import Overlay from './shared/Overlay';
import { useHistoryData } from '../hooks/useHistoryData';
import { components, spacing } from '../lib/design-system';
import { getDayLabel, type Transcription } from '../lib/history';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTranscription: (transcription: Transcription) => void;
  currentTranscript: string;
}

interface GroupedTranscriptions {
  dayLabel: string;
  transcriptions: Transcription[];
}

const HistorySidebar = ({
  isOpen,
  onClose,
  onSelectTranscription,
  currentTranscript
}: HistorySidebarProps) => {
  const { transcriptions, isLoading, loadHistory } = useHistoryData();

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen, loadHistory]);

  // Group transcriptions by day
  const groupedTranscriptions: GroupedTranscriptions[] = transcriptions.reduce(
    (acc, transcription) => {
      const dayLabel = getDayLabel(transcription.timestamp);
      const existing = acc.find(g => g.dayLabel === dayLabel);
      if (existing) {
        existing.transcriptions.push(transcription);
      } else {
        acc.push({ dayLabel, transcriptions: [transcription] });
      }
      return acc;
    },
    [] as GroupedTranscriptions[]
  );

  const handleTranscriptionClick = (transcription: Transcription) => {
    onSelectTranscription(transcription);
    navigator.clipboard.writeText(transcription.text);
  };

  if (!isOpen) return null;

  return (
    <>
      <Overlay onClose={onClose} />

      {/* Sidebar */}
      <div
        style={{
          ...components.sidebar.base,
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '320px',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          WebkitAppRegion: 'no-drag'
        }}
      >
        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: spacing.lg
          }}
        >
          {isLoading ? (
            <LoadingState message="Chargement..." />
          ) : transcriptions.length === 0 ? (
            <EmptyState message="Aucune transcription" />
          ) : (
            groupedTranscriptions.map(group => (
              <TranscriptionGroup
                key={group.dayLabel}
                dayLabel={group.dayLabel}
                transcriptions={group.transcriptions}
                currentTranscript={currentTranscript}
                onSelectTranscription={handleTranscriptionClick}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default HistorySidebar;
