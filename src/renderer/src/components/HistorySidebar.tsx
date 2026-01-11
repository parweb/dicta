import { useEffect, useMemo, useState, useDeferredValue, useTransition, useCallback, useRef } from 'react';
import Fuse from 'fuse.js';
import { useVirtualizer } from '@tanstack/react-virtual';

import SearchInput from './history/SearchInput';
import TranscriptionCard from './history/TranscriptionCard';
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

type VirtualItem =
  | { type: 'header'; dayLabel: string }
  | { type: 'transcription'; transcription: Transcription };

const HistorySidebar = ({
  isOpen,
  onClose,
  onSelectTranscription,
  currentTranscript
}: HistorySidebarProps) => {
  const { transcriptions, isLoading, loadHistory } = useHistoryData();
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const parentRef = useRef<HTMLDivElement>(null);

  // Defer the search query to not block the UI while typing
  const deferredSearchQuery = useDeferredValue(searchQuery);

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

  // Filter transcriptions based on deferred search query
  const filteredTranscriptions = useMemo(() => {
    if (!deferredSearchQuery.trim()) {
      return transcriptions;
    }

    const results = fuse.search(deferredSearchQuery);
    return results.map(result => result.item);
  }, [transcriptions, deferredSearchQuery, fuse]);

  // Create flat list of virtual items (headers + transcriptions)
  const virtualItems = useMemo(() => {
    const items: VirtualItem[] = [];
    const groupedByDay = new Map<string, Transcription[]>();

    // Group transcriptions by day
    filteredTranscriptions.forEach(transcription => {
      const dayLabel = getDayLabel(transcription.timestamp);
      if (!groupedByDay.has(dayLabel)) {
        groupedByDay.set(dayLabel, []);
      }
      groupedByDay.get(dayLabel)!.push(transcription);
    });

    // Flatten into virtual items list
    groupedByDay.forEach((transcriptions, dayLabel) => {
      items.push({ type: 'header', dayLabel });
      transcriptions.forEach(transcription => {
        items.push({ type: 'transcription', transcription });
      });
    });

    return items;
  }, [filteredTranscriptions]);

  // Setup virtualizer with dynamic sizing
  const rowVirtualizer = useVirtualizer({
    count: virtualItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Default estimate
    overscan: 5,
    measureElement:
      typeof window !== 'undefined' && navigator.userAgent.indexOf('Firefox') === -1
        ? element => element?.getBoundingClientRect().height
        : undefined
  });

  const handleTranscriptionClick = useCallback((transcription: Transcription) => {
    onSelectTranscription(transcription);
    navigator.clipboard.writeText(transcription.text);
  }, [onSelectTranscription]);

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
          gap: spacing.md,
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
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '32px',
                    height: '32px',
                    padding: `0 ${spacing.sm}`,
                    backgroundColor: colors.accent.blue.background,
                    borderRadius: borderRadius.sm,
                    fontSize: typography.fontSize.base,
                    color: colors.accent.blue.primary,
                    fontWeight: typography.fontWeight.semibold,
                    flexShrink: 0,
                    opacity: isPending ? 0.5 : 1,
                    transition: 'opacity 0.15s'
                  }}
                >
                  {filteredTranscriptions.length}
                </div>
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Rechercher dans l'historique..."
                  style={{ flex: 1, marginBottom: 0 }}
                />
              </div>
            </div>

            {/* Scrollable content with virtualization */}
            <div
              ref={parentRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                opacity: isPending ? 0.6 : 1,
                transition: 'opacity 0.15s'
              }}
            >
              {virtualItems.length === 0 ? (
                <div style={{ padding: spacing.lg }}>
                  <EmptyState message="Aucun résultat trouvé" />
                </div>
              ) : (
                <div
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                    paddingTop: spacing.md,
                    paddingBottom: spacing['2xl']
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map(virtualRow => {
                      const item = virtualItems[virtualRow.index];
                      const isFirstItem = virtualRow.index === 0;
                      const nextItem = virtualItems[virtualRow.index + 1];
                      const isLastCardBeforeHeader = item.type === 'transcription' && nextItem?.type === 'header';

                      return (
                        <div
                          key={virtualRow.key}
                          data-index={virtualRow.index}
                          ref={rowVirtualizer.measureElement}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            transform: `translateY(${virtualRow.start}px)`,
                            paddingLeft: spacing.lg,
                            paddingRight: spacing.lg
                          }}
                        >
                          {item.type === 'header' ? (
                            <h3
                              style={{
                                fontSize: typography.fontSize.sm,
                                fontWeight: typography.fontWeight.semibold,
                                color: colors.text.tertiary,
                                marginTop: isFirstItem ? 0 : spacing['2xl'],
                                marginBottom: spacing.sm,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}
                            >
                              {item.dayLabel}
                            </h3>
                          ) : (
                            <div style={{ marginBottom: isLastCardBeforeHeader ? 0 : spacing.sm }}>
                              <TranscriptionCard
                                transcription={item.transcription}
                                isActive={item.transcription.text === currentTranscript}
                                onClick={handleTranscriptionClick}
                              />
                            </div>
                          )}
                        </div>
                      );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default HistorySidebar;
