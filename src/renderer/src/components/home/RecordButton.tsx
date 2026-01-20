import { Loader2, Mic, MicOff } from 'lucide-react';
import { useThemeStore } from '@/hooks/useThemeStore';
import './RecordButton.css';

interface RecordButtonProps {
  isRecording: boolean;
  isLoading: boolean;
  onMouseDown: () => void;
  onMouseUp: () => void;
}

const RecordButton = ({
  isRecording,
  isLoading,
  onMouseDown,
  onMouseUp
}: RecordButtonProps) => {
  const { theme } = useThemeStore();

  return (
    <div className="record-button-container">
      {/* Animated rings during recording */}
      {isRecording && (
        <>
          <div className="pulse-ring pulse-ring-1" />
          <div className="pulse-ring pulse-ring-2" />
          <div className="pulse-ring pulse-ring-3" />
        </>
      )}

      {/* Main button */}
      <button
        type="button"
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        disabled={isLoading}
        aria-label={isRecording ? 'Recording...' : 'Start recording'}
        className={`record-button ${isRecording ? 'recording' : ''} ${isLoading ? 'loading' : ''}`}
        style={{
          WebkitAppRegion: 'no-drag'
        } as React.CSSProperties}
      >
        {/* Glow effect */}
        {isRecording && <div className="record-glow" />}

        {/* Icon */}
        <div className="record-icon">
          {isRecording ? (
            <Mic size={36} strokeWidth={2} />
          ) : isLoading ? (
            <Loader2 size={36} strokeWidth={2} className="animate-spin" />
          ) : (
            <MicOff size={36} strokeWidth={2} />
          )}
        </div>

        {/* Status text */}
        <div className="record-status">
          {isRecording ? 'RECORDING' : isLoading ? 'PROCESSING' : 'HOLD X'}
        </div>
      </button>

      {/* Recording indicator dot */}
      {isRecording && (
        <div className="recording-indicator">
          <div className="indicator-dot" />
          <span className="indicator-text">REC</span>
        </div>
      )}
    </div>
  );
};

export default RecordButton;
