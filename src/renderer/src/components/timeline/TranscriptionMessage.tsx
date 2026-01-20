/**
 * Transcription Message Component - Voice Terminal Style
 * Displays transcription with terminal-inspired aesthetic
 */

import { memo } from 'react';
import { Copy, Sparkles } from 'lucide-react';
import { useThemeStore } from '@/hooks/useThemeStore';
import AudioWaveform from '../AudioWaveform';
import './TranscriptionMessage.css';

interface TranscriptionMessageProps {
  text: string;
  audioAmplitudes?: number[];
  audioDuration?: number;
  timestamp: number;
  isSelected?: boolean;
  onCopy?: () => void;
  onOpenActions?: () => void;
}

const TranscriptionMessage = memo(function TranscriptionMessage({
  text,
  audioAmplitudes = [],
  audioDuration,
  timestamp,
  isSelected = false,
  onCopy,
  onOpenActions
}: TranscriptionMessageProps) {
  const { theme } = useThemeStore();

  // Format timestamp
  const date = new Date(timestamp);
  const timeString = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Format duration
  const durationSeconds = audioDuration ? Math.round(audioDuration / 1000) : 0;

  return (
    <div className={`transcription-message ${isSelected ? 'selected' : ''}`}>
      {/* Header with timestamp and actions */}
      <div className="message-header">
        <div className="message-meta">
          <span className="message-time">{timeString}</span>
          {durationSeconds > 0 && (
            <>
              <span className="message-separator">•</span>
              <span className="message-duration">{durationSeconds}s</span>
            </>
          )}
        </div>

        <div className="message-actions">
          {onOpenActions && (
            <button
              onClick={onOpenActions}
              className="action-button action-bedrock"
              title="Actions IA"
            >
              <Sparkles size={14} />
              <span>Actions</span>
            </button>
          )}
          {onCopy && (
            <button
              onClick={onCopy}
              className="action-button action-copy"
              title="Copier"
            >
              <Copy size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Audio waveform visualization */}
      {audioAmplitudes.length > 0 && (
        <div className="waveform-wrapper">
          <AudioWaveform
            amplitudes={audioAmplitudes}
            height={48}
            showDuration={false}
            maxBars={60}
          />
        </div>
      )}

      {/* Transcription text */}
      <div className="message-content">
        <p className="message-text">{text}</p>
      </div>

      {/* Terminal-style border accent */}
      <div className="message-accent" />
    </div>
  );
});

export default TranscriptionMessage;
