import { Loader2, Mic, MicOff } from 'lucide-react';

import { components, getRecordButtonColor } from '../../lib/design-system';

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
  return (
    <button
      type="button"
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      disabled={isLoading}
      aria-label={isRecording ? 'Recording...' : 'Start recording'}
      style={
        {
          ...components.button.record,
          backgroundColor: getRecordButtonColor(isRecording, isLoading),
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.7 : 1,
          WebkitAppRegion: 'no-drag'
        } as React.CSSProperties
      }
    >
      {isRecording ? <Mic /> : isLoading ? <Loader2 className="animate-spin" /> : <MicOff />}
    </button>
  );
};

export default RecordButton;
