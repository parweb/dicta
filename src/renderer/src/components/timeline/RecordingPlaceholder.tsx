/**
 * Recording Placeholder Component
 * Displays a real-time audio waveform while recording
 */

import { useThemeStore } from '@/hooks/useThemeStore';
import './RecordingPlaceholder.css';

interface RecordingPlaceholderProps {
  amplitudes: number[];
}

export default function RecordingPlaceholder({ amplitudes }: RecordingPlaceholderProps) {
  const { theme } = useThemeStore();

  console.log('[RECORDING_PLACEHOLDER] Amplitudes received:', amplitudes.length, 'values');

  // Pad amplitudes to always show at least 50 bars for better visual
  const displayAmplitudes = amplitudes.length > 0
    ? [...amplitudes, ...Array(Math.max(0, 50 - amplitudes.length)).fill(0.05)]
    : Array(50).fill(0.05); // Initial state with minimal amplitude

  const maxAmplitude = Math.max(...displayAmplitudes, 0.1);

  console.log('[RECORDING_PLACEHOLDER] Displaying', displayAmplitudes.length, 'bars, max amplitude:', maxAmplitude);

  return (
    <div className="recording-placeholder">
      {/* Header */}
      <div className="recording-header">
        <div className="recording-meta">
          <div className="recording-indicator">
            <span className="recording-dot" />
            <span className="recording-label">Enregistrement en cours...</span>
          </div>
        </div>
      </div>

      {/* Waveform visualization */}
      <div className="waveform-wrapper">
        <div
          className="waveform-container"
          style={{
            width: '100%',
            display: 'flex',
            gap: '1px',
            height: '60px',
            alignItems: 'flex-end',
            backgroundColor: theme.colors.background.primary,
            borderRadius: theme.borderRadius.md,
            padding: theme.spacing.sm
          }}
        >
          {displayAmplitudes.map((amplitude, index) => {
            // Normalize amplitude to 0-1 range
            const normalizedHeight =
              maxAmplitude > 0 ? (amplitude / maxAmplitude) * 100 : 5;

            // Color based on amplitude with red accent
            const opacity = 0.4 + (amplitude / maxAmplitude) * 0.6;

            return (
              <div
                key={index}
                className="waveform-bar"
                style={{
                  flex: 1,
                  height: `${Math.max(5, normalizedHeight)}%`,
                  backgroundColor: '#ef4444', // Red accent color
                  opacity,
                  borderRadius: theme.borderRadius.xs,
                  minWidth: '1px',
                  transition: 'height 0.1s ease-out, opacity 0.1s ease-out'
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Transcription text placeholder */}
      <div className="recording-text">
        <p className="placeholder-text">
          Parlez maintenant...
        </p>
      </div>
    </div>
  );
}
