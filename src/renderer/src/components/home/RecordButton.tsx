import { Loader2, Mic, MicOff } from 'lucide-react';

import { useTheme } from '../../lib/theme-context';
import { getRecordButtonColor } from '../../lib/theme-utils';

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
  const { theme, baseConfig } = useTheme();
  const { components } = theme;

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
          backgroundColor: getRecordButtonColor(isRecording, isLoading, baseConfig),
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.7 : 1,
          WebkitAppRegion: 'no-drag'
        } as React.CSSProperties
      }
    >
      {isRecording ? (
        <Mic />
      ) : isLoading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <MicOff />
      )}
    </button>
  );
};

export default RecordButton;
