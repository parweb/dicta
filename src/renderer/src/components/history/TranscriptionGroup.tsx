import { memo } from 'react';

import TranscriptionCard from './TranscriptionCard';
import { colors, spacing, typography } from '../../lib/design-system';
import type { Transcription } from '../../lib/history';

interface TranscriptionGroupProps {
  dayLabel: string;
  transcriptions: Transcription[];
  currentTranscript: string;
  onSelectTranscription: (transcription: Transcription) => void;
}

const TranscriptionGroup = memo(({
  dayLabel,
  transcriptions,
  currentTranscript,
  onSelectTranscription
}: TranscriptionGroupProps) => {
  return (
    <div style={{ marginBottom: spacing['2xl'] }}>
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
        {dayLabel}
      </h3>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.sm
        }}
      >
        {transcriptions.map(transcription => {
          const isActive = transcription.text === currentTranscript;
          return (
            <TranscriptionCard
              key={transcription.id}
              transcription={transcription}
              isActive={isActive}
              onClick={onSelectTranscription}
            />
          );
        })}
      </div>
    </div>
  );
});

TranscriptionGroup.displayName = 'TranscriptionGroup';

export default TranscriptionGroup;
