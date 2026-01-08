import { Loader2, Mic, MicOff } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const apiKey =
  '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';

const HomePage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const transcriptRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .catch(err => console.error('Microphone access denied:', err));
  }, []);

  useEffect(() => {
    const handler = data => {
      console.log('Received custom event:', data);
      startRecording();
    };

    window.api.on('show-mini-app-hot-key', handler);
    return () => {
      window.api.removeListener('show-mini-app-hot-key', handler);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let xKeyIsDown = false;

    document.addEventListener(
      'keydown',
      e => {
        if (e.key === 'x' && !xKeyIsDown) {
          xKeyIsDown = true;
          startRecording();
        }
      },
      { signal: controller.signal }
    );

    document.addEventListener(
      'keyup',
      () => {
        if (isRecording === true) {
          xKeyIsDown = false;
          stopRecording();
        }
      },
      { signal: controller.signal }
    );

    return () => {
      controller.abort();
    };
  }, [isRecording]);

  useEffect(() => {
    if (transcript && transcriptRef.current) {
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(transcriptRef.current);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, [transcript]);

  const startRecording = async () => {
    console.log('startRecording');

    setIsRecording(true);
    audioChunks.current = [];

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);

    mediaRecorder.current.ondataavailable = e => {
      audioChunks.current.push(e.data);
    };

    mediaRecorder.current.onstop = async () => {
      console.log('ici');
      setIsLoading(true);
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
      await transcribeAudio(audioBlob);
      setIsLoading(false);
    };

    mediaRecorder.current.start();
  };

  const stopRecording = () => {
    console.log('stopRecording');
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);

      window.api.send('stop-recording');
    }
  };

  const transcribeAudio = async (blob: Blob) => {
    console.log('transcribeAudio');

    const formData = new FormData();
    formData.append('file', blob, 'recording.webm');
    formData.append('model', 'gpt-4o-transcribe');

    try {
      const response = await fetch(
        'https://proxy.corsfix.com/?https://api.openai.com/v1/audio/transcriptions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`
          },
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('API error:', data);
        throw new Error(data.error?.message || 'Unknown transcription error');
      }

      setTranscript(data.text);
      await navigator.clipboard.writeText(data.text);

      console.log('all good');
    } catch (error) {
      console.error('Transcription error:', error);
    }
  };

  return (
    <div
      style={{
        padding: '20px',
        maxWidth: '600px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <button
        type="button"
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        style={{
          padding: '15px 30px',
          fontSize: '18px',
          backgroundColor: isRecording ? '#ff4444' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          transition: 'background-color 0.3s'
        }}
      >
        {isRecording ? (
          <Mic />
        ) : isLoading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <MicOff />
        )}
      </button>

      <div
        style={{
          transition: 'opacity 0.3s',
          opacity: transcript ? 1 : 0,
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f0f0f0',
          borderRadius: '5px',
          color: 'black',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
          gap: '10px'
        }}
      >
        <h3 style={{ fontSize: '10px', color: 'gray' }}>
          Transcription (copiée dans le presse-papiers):
        </h3>

        <p
          ref={transcriptRef}
          onClick={() => {
            navigator.clipboard.writeText(transcript);
          }}
          style={{
            flex: 1,
            alignSelf: 'stretch',
            backgroundColor: 'rgba(0,0,0, .1)',
            padding: '10px',
            borderRadius: '5px'
          }}
        >
          {transcript}
        </p>
      </div>
    </div>
  );
};

export default HomePage;
