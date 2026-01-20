/**
 * Recording Placeholder Component
 * Displays a real-time audio waveform while recording
 */

import { useEffect, useRef } from 'react';
import { useThemeStore } from '@/hooks/useThemeStore';
import './RecordingPlaceholder.css';

interface RecordingPlaceholderProps {
  amplitudes: number[];
}

export default function RecordingPlaceholder({ amplitudes }: RecordingPlaceholderProps) {
  const { theme } = useThemeStore();
  const waveformContainerRef = useRef<HTMLDivElement>(null);

  console.log('[RECORDING_PLACEHOLDER] Amplitudes received:', amplitudes.length, 'values');

  // Show all accumulated amplitudes
  const displayAmplitudes = amplitudes.length > 0
    ? amplitudes
    : Array(10).fill(0.05); // Initial state with minimal bars

  const maxAmplitude = Math.max(...displayAmplitudes, 0.1);

  console.log('[RECORDING_PLACEHOLDER] Displaying', displayAmplitudes.length, 'bars, max amplitude:', maxAmplitude);

  // Auto-scroll to the end when new amplitudes are added
  useEffect(() => {
    if (waveformContainerRef.current && amplitudes.length > 0) {
      waveformContainerRef.current.scrollLeft = waveformContainerRef.current.scrollWidth;
    }
  }, [amplitudes.length]);

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
          ref={waveformContainerRef}
          className="waveform-container"
          style={{
            width: '100%',
            display: 'flex',
            gap: '2px',
            height: '60px',
            alignItems: 'flex-end',
            backgroundColor: theme.colors.background.primary,
            borderRadius: theme.borderRadius.md,
            padding: theme.spacing.sm,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
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
                  width: '4px',
                  flexShrink: 0,
                  height: `${Math.max(5, normalizedHeight)}%`,
                  backgroundColor: '#ef4444', // Red accent color
                  opacity,
                  borderRadius: theme.borderRadius.xs,
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
