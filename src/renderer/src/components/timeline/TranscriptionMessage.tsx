/**
 * Transcription Message Component - Voice Terminal Style
 * Displays transcription with terminal-inspired aesthetic
 */

import { memo } from 'react';
import { Copy, Sparkles } from 'lucide-react';
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
  onCopy?: () => void;
  onOpenActions?: () => void;
  onCloseActions?: () => void;
  newFollowUpTranscript?: string;
  onFollowUpConsumed?: () => void;
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
  onCopy,
  onOpenActions,
  onCloseActions,
  newFollowUpTranscript,
  onFollowUpConsumed,
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
            maxBars={60}
          />
        </div>
      )}

      {/* Transcription text */}
      <div className="message-content">
        <p className="message-text">{text}</p>
      </div>

      {/* Bedrock History Indicator (when not showing active actions) */}
      {!showActions && bedrockHistory && bedrockHistory.toolsExecuted.length > 0 && onOpenActions && (
        <div style={{ padding: '0 16px', marginTop: '8px' }}>
          <button
            onClick={onOpenActions}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '6px',
              color: 'rgb(96, 165, 250)',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              width: '100%'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'
            }}
          >
            <Sparkles size={14} />
            <span>{bedrockHistory.toolsExecuted.length} action(s) exécutée(s)</span>
            <span style={{ fontSize: '12px', color: 'rgb(148, 163, 184)' }}>• Cliquer pour voir</span>
          </button>
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
