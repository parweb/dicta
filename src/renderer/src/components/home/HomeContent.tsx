import RecordButton from './RecordButton';
import TranscriptionDisplay from './TranscriptionDisplay';

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
  onCopyTranscript
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
          padding: '20px',
          maxWidth: '600px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <RecordButton
          isRecording={isRecording}
          isLoading={isLoading}
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
        />

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
