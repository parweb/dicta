import AudioPlayerWithRetry from './AudioPlayerWithRetry';
import RecordButton from './RecordButton';
import TranscriptionDisplay from './TranscriptionDisplay';
import { spacing } from '../../lib/design-system';

interface HomeContentProps {
  isRecording: boolean;
  isLoading: boolean;
  transcript: string;
  transcriptRef: React.RefObject<HTMLParagraphElement>;
  slideDirection: 'up' | 'down' | null;
  audioAmplitudes: number[];
  audioDuration?: number;
  startRecording: () => void;
  stopRecording: () => void;
  onCopyTranscript: () => void;
  transcriptionError?: string;
  failedAudioBlob?: Blob;
  onRetry: () => void;
}

const HomeContent = ({
  isRecording,
  isLoading,
  transcript,
  transcriptRef,
  slideDirection,
  audioAmplitudes,
  audioDuration,
  startRecording,
  stopRecording,
  onCopyTranscript,
  transcriptionError,
  failedAudioBlob,
  onRetry
}: HomeContentProps) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1
      }}
    >
      <div
        style={{
          padding: spacing.xl,
          maxWidth: '600px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: spacing.xl
        }}
      >
        <RecordButton
          isRecording={isRecording}
          isLoading={isLoading}
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
        />

        {transcriptionError && failedAudioBlob && (
          <AudioPlayerWithRetry
            audioBlob={failedAudioBlob}
            error={transcriptionError}
            onRetry={onRetry}
            isLoading={isLoading}
          />
        )}

        <TranscriptionDisplay
          transcript={transcript}
          transcriptRef={transcriptRef}
          slideDirection={slideDirection}
          audioAmplitudes={audioAmplitudes}
          audioDuration={audioDuration}
          onCopyTranscript={onCopyTranscript}
        />
      </div>
    </div>
  );
};

export default HomeContent;
