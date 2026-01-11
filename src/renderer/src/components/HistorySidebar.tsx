import { useEffect, useMemo, useState } from 'react';
import Fuse from 'fuse.js';

import SearchInput from './history/SearchInput';
import TranscriptionGroup from './history/TranscriptionGroup';
import EmptyState from './shared/EmptyState';
import LoadingState from './shared/LoadingState';
import Overlay from './shared/Overlay';
import { useHistoryData } from '../hooks/useHistoryData';
import { components, spacing, colors, typography, borderRadius } from '../lib/design-system';
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
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen, loadHistory]);

  // Configure Fuse.js for intelligent fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(transcriptions, {
      keys: [
        {
          name: 'text',
          weight: 0.7 // Text content is most important
        },
        {
          name: 'id',
          weight: 0.3 // Date/time can help filter
        }
      ],
      threshold: 0.4, // 0 = perfect match, 1 = match anything
      distance: 100, // Maximum distance between characters
      minMatchCharLength: 2, // Minimum length to start matching
      ignoreLocation: true, // Search anywhere in the text
      useExtendedSearch: true, // Enable advanced search patterns
      includeScore: true // Include relevance score
    });
  }, [transcriptions]);

  // Filter transcriptions based on search query
  const filteredTranscriptions = useMemo(() => {
    if (!searchQuery.trim()) {
      return transcriptions;
    }

    const results = fuse.search(searchQuery);
    return results.map(result => result.item);
  }, [transcriptions, searchQuery, fuse]);

  // Group filtered transcriptions by day
  const groupedTranscriptions: GroupedTranscriptions[] = filteredTranscriptions.reduce(
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
        {isLoading ? (
          <div style={{ padding: spacing.lg }}>
            <LoadingState message="Chargement..." />
          </div>
        ) : transcriptions.length === 0 ? (
          <div style={{ padding: spacing.lg }}>
            <EmptyState message="Aucune transcription" />
          </div>
        ) : (
          <>
            {/* Fixed search header */}
            <div
              style={{
                padding: spacing.lg,
                paddingBottom: 0,
                flexShrink: 0
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.sm
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '28px',
                    height: '28px',
                    padding: `0 ${spacing.sm}`,
                    backgroundColor: colors.background.tertiary,
                    borderRadius: borderRadius.sm,
                    fontSize: typography.fontSize.sm,
                    color: colors.text.secondary,
                    fontWeight: typography.fontWeight.medium,
                    flexShrink: 0
                  }}
                >
                  {filteredTranscriptions.length}
                </div>
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Rechercher dans l'historique..."
                />
              </div>
            </div>

            {/* Scrollable content */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: spacing.lg,
                paddingTop: spacing.md
              }}
            >
              {groupedTranscriptions.length === 0 ? (
                <EmptyState message="Aucun résultat trouvé" />
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
          </>
        )}
      </div>
    </>
  );
};

export default HistorySidebar;
