import { Sparkles } from 'lucide-react';

import AudioWaveform from '../AudioWaveform';
import { useTheme } from '../../lib/theme-context';

interface TranscriptionDisplayProps {
  transcript: string;
  transcriptRef: React.RefObject<HTMLParagraphElement | null>;
  slideDirection: 'up' | 'down' | null;
  audioAmplitudes: number[];
  audioDuration?: number;
  onCopyTranscript: () => void;
  onOpenActions?: () => void;
}

const TranscriptionDisplay = ({
  transcript,
  transcriptRef,
  slideDirection,
  audioAmplitudes,
  audioDuration,
  onCopyTranscript,
  onOpenActions
}: TranscriptionDisplayProps) => {
  const { theme } = useTheme();
  const { colors, spacing, typography, borderRadius, components } = theme;

  return (
    <div
      style={
        {
          transition: 'opacity 0.3s, transform 0.3s ease-out',
          opacity: transcript ? 1 : 0,
          transform:
            slideDirection === 'up'
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
        onClick={onCopyTranscript}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onCopyTranscript();
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

      {/* Actions button */}
      {onOpenActions && (
        <button
          onClick={onOpenActions}
          style={
            {
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
              padding: `${spacing.sm}px ${spacing.md}px`,
              backgroundColor: colors.accent.blue,
              color: colors.text.primary,
              border: 'none',
              borderRadius: borderRadius.sm,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              cursor: 'pointer',
              transition: 'opacity 0.15s',
              WebkitAppRegion: 'no-drag'
            } as React.CSSProperties
          }
          onMouseEnter={e => {
            e.currentTarget.style.opacity = '0.8';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          <Sparkles size={16} />
          <span>Actions</span>
        </button>
      )}

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
  );
};

export default TranscriptionDisplay;
