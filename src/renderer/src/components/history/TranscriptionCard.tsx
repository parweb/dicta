import { useState } from 'react';

import AudioWaveform from '../AudioWaveform';
import { borderRadius, colors, spacing, typography } from '../../lib/design-system';
import { formatRelativeTime, type Transcription } from '../../lib/history';
import { formatDuration } from '../../lib/statistics';

interface TranscriptionCardProps {
  transcription: Transcription;
  isActive: boolean;
  onClick: (transcription: Transcription) => void;
}

const TranscriptionCard = ({
  transcription,
  isActive,
  onClick
}: TranscriptionCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={() => onClick(transcription)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: spacing.md,
        backgroundColor: isActive
          ? colors.accent.blue.backgroundHover
          : isHovered
            ? colors.background.secondary
            : colors.background.primary,
        borderRadius: borderRadius.md,
        cursor: 'pointer',
        border: isActive
          ? `1px solid ${colors.border.accent}`
          : `1px solid ${isHovered ? colors.border.secondary : colors.border.primary}`,
        transition: 'all 0.2s'
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
        {transcription.durationMs && (
          <>
            <span>•</span>
            <span>{formatDuration(transcription.durationMs / 60000)}</span>
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
          duration={transcription.durationMs}
          showDuration={false}
          height={40}
          maxBars={80}
        />
      )}
    </div>
  );
};

export default TranscriptionCard;
