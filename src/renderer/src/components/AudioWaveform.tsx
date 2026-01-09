import { borderRadius, colors, spacing, typography } from '../lib/design-system';
import { formatDuration } from '../lib/statistics';

interface AudioWaveformProps {
  amplitudes: number[];
  duration?: number;
  showDuration?: boolean;
  height?: number;
  maxBars?: number; // Maximum number of bars to display (for responsive)
}

const AudioWaveform = ({
  amplitudes,
  duration,
  showDuration = true,
  height = 60,
  maxBars
}: AudioWaveformProps) => {
  if (amplitudes.length === 0) return null;

  // Downsample amplitudes if maxBars is specified and we have more bars
  let displayAmplitudes = amplitudes;
  if (maxBars && amplitudes.length > maxBars) {
    const samplesPerBar = Math.ceil(amplitudes.length / maxBars);
    displayAmplitudes = [];
    for (let i = 0; i < maxBars; i++) {
      const start = i * samplesPerBar;
      const end = Math.min(start + samplesPerBar, amplitudes.length);
      let sum = 0;
      for (let j = start; j < end; j++) {
        sum += amplitudes[j];
      }
      displayAmplitudes.push(sum / (end - start));
    }
  }

  const maxAmplitude = Math.max(...displayAmplitudes);

  return (
    <div
      style={{
        alignSelf: 'stretch'
      }}
    >
      {/* Header with title and optional duration */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.sm
        }}
      >
        <h4
          style={{
            fontSize: typography.fontSize.xs,
            color: colors.text.tertiary,
            margin: 0
          }}
        >
          Forme d'onde audio:
        </h4>
        {showDuration && duration !== undefined && (
          <span
            style={{
              fontSize: typography.fontSize.xs,
              color: colors.text.tertiary,
              fontWeight: typography.fontWeight.medium
            }}
          >
            {formatDuration(duration / 60)}
          </span>
        )}
      </div>

      {/* Waveform visualization */}
      <div
        style={{
          display: 'flex',
          gap: '1px',
          height: `${height}px`,
          alignItems: 'flex-end',
          backgroundColor: colors.background.primary,
          borderRadius: borderRadius.md,
          padding: spacing.sm
        }}
      >
        {displayAmplitudes.map((amplitude, index) => {
          // Normalize amplitude to 0-1 range
          const normalizedHeight =
            maxAmplitude > 0 ? (amplitude / maxAmplitude) * 100 : 0;

          // Color based on amplitude (quiet = blue, loud = white)
          const opacity = 0.3 + (amplitude / maxAmplitude) * 0.7;

          return (
            <div
              key={index}
              style={{
                flex: 1,
                height: `${Math.max(2, normalizedHeight)}%`,
                backgroundColor: colors.accent.blue.primary,
                opacity,
                borderRadius: '1px',
                minWidth: '1px'
              }}
              title={`Segment ${index + 1}: ${(amplitude * 100).toFixed(1)}%`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AudioWaveform;
