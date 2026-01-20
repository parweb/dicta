/**
 * Transcription Message Component - Voice Terminal Style
 * Displays transcription with terminal-inspired aesthetic
 */

import { memo } from 'react';
import { Copy, Sparkles } from 'lucide-react';
import { useThemeStore } from '@/hooks/useThemeStore';
import AudioWaveform from '../AudioWaveform';
import BedrockAgentInline from '../bedrock/BedrockAgentInline';
import BedrockHistoryDisplay from '../bedrock/BedrockHistoryDisplay';
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
  onCopy?: () => void;
  onOpenActions?: () => void;
  onCloseActions?: () => void;
  newFollowUpTranscript?: string;
  onFollowUpConsumed?: () => void;
  bedrockHistory?: BedrockConversationHistory;
  onBedrockHistoryChange?: (history: ConversationHistory) => void;
  historyDisplayVariant?: string;
}

const TranscriptionMessage = memo(function TranscriptionMessage({
  text,
  audioAmplitudes = [],
  audioDuration,
  timestamp,
  isSelected = false,
  showActions = false,
  onCopy,
  onOpenActions,
  onCloseActions,
  newFollowUpTranscript,
  onFollowUpConsumed,
  bedrockHistory,
  onBedrockHistoryChange,
  historyDisplayVariant = 'accordion'
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

      {/* Bedrock History Indicator (when not showing active actions) */}
      {!showActions && bedrockHistory && bedrockHistory.toolsExecuted.length > 0 && (
        <div style={{ padding: '0 16px' }}>
          <BedrockHistoryDisplay
            history={bedrockHistory}
            variant={historyDisplayVariant}
            onClick={onOpenActions}
          />
        </div>
      )}

      {/* Terminal-style border accent */}
      <div className="message-accent" />

      {/* Bedrock Agent Inline */}
      {showActions && (
        <BedrockAgentInline
          transcriptContext={text}
          onClose={() => onCloseActions?.()}
          newTranscript={newFollowUpTranscript}
          onTranscriptConsumed={onFollowUpConsumed}
          initialHistory={bedrockHistory}
          onHistoryChange={onBedrockHistoryChange}
        />
      )}
    </div>
  );
});

export default TranscriptionMessage;
