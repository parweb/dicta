import { useEffect, useState } from 'react';

import AudioWaveform from './AudioWaveform';
import {
  borderRadius,
  colors,
  components,
  spacing,
  typography
} from '../lib/design-system';
import {
  formatRelativeTime,
  getDayLabel,
  type Transcription
} from '../lib/history';
import { formatDuration } from '../lib/statistics';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTranscription: (text: string) => void;
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
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const result = await window.api?.history.loadAll();
      if (result?.success && result.transcriptions) {
        setTranscriptions(result.transcriptions as Transcription[]);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleTranscriptionClick = (text: string) => {
    onSelectTranscription(text);
    navigator.clipboard.writeText(text);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: colors.background.overlay,
          zIndex: 0,
          WebkitAppRegion: 'no-drag'
        }}
      />

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
            <div
              style={{
                textAlign: 'center',
                padding: spacing.xl,
                color: colors.text.tertiary
              }}
            >
              Chargement...
            </div>
          ) : transcriptions.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: spacing.xl,
                color: colors.text.tertiary
              }}
            >
              Aucune transcription
            </div>
          ) : (
            groupedTranscriptions.map(group => (
              <div key={group.dayLabel} style={{ marginBottom: spacing['2xl'] }}>
                <h3
                  style={{
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.tertiary,
                    marginBottom: spacing.sm,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  {group.dayLabel}
                </h3>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: spacing.sm
                  }}
                >
                  {group.transcriptions.map(transcription => {
                    const isActive = transcription.text === currentTranscript;
                    return (
                      <div
                        key={transcription.id}
                        onClick={() =>
                          handleTranscriptionClick(transcription.text)
                        }
                        style={{
                          padding: spacing.md,
                          backgroundColor: isActive
                            ? colors.accent.blue.backgroundHover
                            : colors.background.primary,
                          borderRadius: borderRadius.md,
                          cursor: 'pointer',
                          border: isActive
                            ? `1px solid ${colors.border.accent}`
                            : `1px solid ${colors.border.primary}`,
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor =
                              colors.background.secondary;
                            e.currentTarget.style.borderColor =
                              colors.border.secondary;
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor =
                              colors.background.primary;
                            e.currentTarget.style.borderColor =
                              colors.border.primary;
                          }
                        }}
                      >
                      <div
                        style={{
                          fontSize: typography.fontSize.sm,
                          color: colors.text.tertiary,
                          marginBottom: '6px',
                          display: 'flex',
                          gap: spacing.sm,
                          alignItems: 'center'
                        }}
                      >
                        <span>{formatRelativeTime(transcription.timestamp)}</span>
                        {transcription.durationSeconds && (
                          <>
                            <span>•</span>
                            <span>{formatDuration(transcription.durationSeconds / 60)}</span>
                          </>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: typography.fontSize.base,
                          color: colors.text.secondary,
                          lineHeight: '1.4',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          marginBottom: transcription.audioAmplitudes ? spacing.sm : 0
                        }}
                      >
                        {transcription.text}
                      </div>

                      {/* Audio waveform visualization */}
                      {transcription.audioAmplitudes && transcription.audioAmplitudes.length > 0 && (
                        <AudioWaveform
                          amplitudes={transcription.audioAmplitudes}
                          duration={transcription.durationSeconds}
                          showDuration={false}
                          height={40}
                          maxBars={80}
                        />
                      )}
                    </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default HistorySidebar;
