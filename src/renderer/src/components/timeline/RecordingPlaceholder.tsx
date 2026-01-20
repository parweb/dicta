/**
 * Recording Placeholder Component
 * Displays a real-time audio waveform while recording
 */

import AudioWaveform from '@/components/AudioWaveform';
import './RecordingPlaceholder.css';

interface RecordingPlaceholderProps {
  amplitudes: number[];
}

export default function RecordingPlaceholder({ amplitudes }: RecordingPlaceholderProps) {
  console.log('[RECORDING_PLACEHOLDER] Amplitudes received:', amplitudes.length, 'values');

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
      <AudioWaveform
        amplitudes={amplitudes.length > 0 ? amplitudes : [0.05]}
        showDuration={false}
        height={60}
        maxBars={200}
        color="#ef4444"
      />

      {/* Transcription text placeholder */}
      <div className="recording-text">
        <p className="placeholder-text">
          Parlez maintenant...
        </p>
      </div>
    </div>
  );
}
