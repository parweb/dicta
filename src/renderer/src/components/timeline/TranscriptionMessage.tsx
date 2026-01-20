/**
 * Transcription Message Component - Voice Terminal Style
 * Displays transcription with terminal-inspired aesthetic
 */

import { memo } from 'react';
import { Copy, Sparkles, Loader2 } from 'lucide-react';
import { useThemeStore } from '@/hooks/useThemeStore';
import AudioWaveform from '../AudioWaveform';
import BedrockAgentInline from '../bedrock/BedrockAgentInline';
import type { BedrockConversationHistory } from '@/lib/history';
import type { ConversationHistory } from '@/hooks/useBedrockAgent';
import './TranscriptionMessage.css';

interface TranscriptionMessageProps {
  text: string;
  audioAmplitudes?: number[];
  audioDuration?: number;
  timestamp: number;
  isSelected?: boolean;
  showActions?: boolean;
  isRecording?: boolean;
  isLoading?: boolean;
  onCopy?: () => void;
  onOpenActions?: () => void;
  onCloseActions?: () => void;
  newFollowUpTranscript?: string;
  onFollowUpConsumed?: () => void;
  onFollowUpFocusChange?: (isFocused: boolean) => void;
  bedrockHistory?: BedrockConversationHistory;
  onBedrockHistoryChange?: (history: ConversationHistory) => void;
}

const TranscriptionMessage = memo(function TranscriptionMessage({
  text,
  audioAmplitudes = [],
  audioDuration,
  timestamp,
  isSelected = false,
  showActions = false,
  isRecording = false,
  isLoading = false,
  onCopy,
  onOpenActions,
  onCloseActions,
  newFollowUpTranscript,
  onFollowUpConsumed,
  onFollowUpFocusChange,
  bedrockHistory,
  onBedrockHistoryChange
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
            maxBars={(isRecording || isLoading) ? 200 : 60}
            color={(isRecording || isLoading) ? '#ef4444' : undefined}
          />
        </div>
      )}

      {/* Transcription text or loader */}
      <div className="message-content">
        {isLoading ? (
          <div className="message-loader">
            <Loader2 size={16} className="loader-spin" />
            <span className="loader-text">Transcription en cours...</span>
          </div>
        ) : text ? (
          <p className="message-text">{text}</p>
        ) : null}
      </div>

      {/* Terminal-style border accent */}
      <div className="message-accent" />

      {/* Bedrock Agent Inline - shown when actions active OR when history exists */}
      {(showActions || bedrockHistory) && (
        <BedrockAgentInline
          transcriptContext={text}
          onClose={showActions ? () => onCloseActions?.() : undefined}
          newTranscript={newFollowUpTranscript}
          onTranscriptConsumed={onFollowUpConsumed}
          onFollowUpFocusChange={onFollowUpFocusChange}
          initialHistory={bedrockHistory}
          onHistoryChange={onBedrockHistoryChange}
          initiallyCollapsed={!showActions && !!bedrockHistory}
        />
      )}
    </div>
  );
});

export default TranscriptionMessage;
