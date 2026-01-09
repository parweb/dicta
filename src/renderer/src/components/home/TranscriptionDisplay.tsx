import AudioWaveform from '../AudioWaveform';
import { borderRadius, colors, components, spacing, typography } from '../../lib/design-system';

interface TranscriptionDisplayProps {
  transcript: string;
  transcriptRef: React.RefObject<HTMLParagraphElement>;
  slideDirection: 'up' | 'down' | null;
  audioAmplitudes: number[];
  audioDuration?: number;
  onCopyTranscript: () => void;
}

const TranscriptionDisplay = ({
  transcript,
  transcriptRef,
  slideDirection,
  audioAmplitudes,
  audioDuration,
  onCopyTranscript
}: TranscriptionDisplayProps) => {
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
