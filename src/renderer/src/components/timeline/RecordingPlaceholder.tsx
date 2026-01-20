/**
 * Recording Placeholder Component
 * Displays a real-time audio waveform while recording
 */

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import AudioWaveform from '@/components/AudioWaveform';
import './RecordingPlaceholder.css';

interface RecordingPlaceholderProps {
  amplitudes: number[];
  isRecording: boolean;
  isLoading: boolean;
}

export default function RecordingPlaceholder({ amplitudes, isRecording, isLoading }: RecordingPlaceholderProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime] = useState(Date.now());

  console.log('[RECORDING_PLACEHOLDER] Amplitudes received:', amplitudes.length, 'values');

  // Update elapsed time every 100ms while recording or loading
  useEffect(() => {
    if (!isRecording && !isLoading) return;

    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 100);

    return () => clearInterval(interval);
  }, [isRecording, isLoading, startTime]);

  // Format duration as "XXs" (e.g., "3s", "12s")
  const formattedDuration = Math.floor(elapsedTime / 1000) + 's';

  return (
    <div className="recording-placeholder">
      {/* Header with timer */}
      <div className="recording-header">
        <div className="recording-meta">
          <span className="message-time">{formattedDuration}</span>
        </div>
        {isLoading && (
          <div className="recording-loader">
            <Loader2 size={14} className="loader-spin" />
          </div>
        )}
      </div>

      {/* Waveform visualization */}
      <AudioWaveform
        amplitudes={amplitudes.length > 0 ? amplitudes : [0.05]}
        showDuration={false}
        height={60}
        maxBars={200}
        color="#ef4444"
      />
    </div>
  );
}
