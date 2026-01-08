import { Loader2, Mic, MicOff } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const apiKey =
  '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';

type ProxyStatus = 'idle' | 'loading' | 'success' | 'error' | 'cancelled';

const HomePage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [proxyStatuses, setProxyStatuses] = useState<
    Record<string, ProxyStatus>
  >({
    corsfix: 'idle',
    corsproxy: 'idle',
    allorigins: 'idle',
    codetabs: 'idle'
  });

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

    // Réinitialiser les statuts
    setProxyStatuses({
      corsfix: 'loading',
      corsproxy: 'loading',
      allorigins: 'loading',
      codetabs: 'loading'
    });

    // Liste des proxies CORS à utiliser en parallèle
    const proxies = [
      {
        name: 'corsfix',
        url: 'https://proxy.corsfix.com/?https://api.openai.com/v1/audio/transcriptions'
      },
      {
        name: 'corsproxy',
        url: 'https://corsproxy.io/?https://api.openai.com/v1/audio/transcriptions'
      },
      {
        name: 'allorigins',
        url: 'https://api.allorigins.win/raw?url=https://api.openai.com/v1/audio/transcriptions'
      },
      {
        name: 'codetabs',
        url: 'https://api.codetabs.com/v1/proxy?quest=https://api.openai.com/v1/audio/transcriptions'
      }
    ];

    // Fonction pour fetch avec un proxy spécifique
    const fetchWithProxy = async (proxy: { name: string; url: string }) => {
      try {
        console.log(`Tentative avec ${proxy.name}`);
        const response = await fetch(proxy.url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`
          },
          body: formData
        });

        if (!response.ok) {
          const data = await response.json();
          setProxyStatuses(prev => ({ ...prev, [proxy.name]: 'error' }));
          throw new Error(data.error?.message || `Erreur proxy: ${proxy.name}`);
        }

        const data = await response.json();
        console.log(`✓ Succès avec ${proxy.name}`);
        setProxyStatuses(prev => ({ ...prev, [proxy.name]: 'success' }));
        return data;
      } catch (error) {
        console.warn(`✗ Échec avec ${proxy.name}:`, error);
        setProxyStatuses(prev => ({ ...prev, [proxy.name]: 'error' }));
        throw error;
      }
    };

    try {
      // Promise.any() retourne la première promesse qui RÉUSSIT
      const data = await Promise.any(
        proxies.map(proxy => fetchWithProxy(proxy))
      );

      // Marquer les autres proxies comme "cancelled" (annulé car un autre a gagné)
      setProxyStatuses(prev => {
        const newStatuses = { ...prev };
        Object.keys(newStatuses).forEach(key => {
          if (newStatuses[key] === 'loading') {
            newStatuses[key] = 'cancelled';
          }
        });
        return newStatuses;
      });

      setTranscript(data.text);
      await navigator.clipboard.writeText(data.text);

      console.log('all good');
    } catch (error) {
      if (error instanceof AggregateError) {
        console.error('Tous les proxies ont échoué:', error.errors);
      } else {
        console.error('Transcription error:', error);
      }
    }
  };

  const getStatusColor = (status: ProxyStatus) => {
    switch (status) {
      case 'success':
        return '#4ade80'; // vert
      case 'error':
        return '#ef4444'; // rouge
      case 'cancelled':
        return '#9ca3af'; // gris
      case 'loading':
        return '#ffffff'; // blanc
      default:
        return '#d1d5db'; // gris clair
    }
  };

  const getStatusLabel = (status: ProxyStatus) => {
    switch (status) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'cancelled':
        return '◌';
      case 'loading':
        return '⋯';
      default:
        return '○';
    }
  };

  return (
    <>
      {/* Indicateurs de statut des proxies - fixés en haut à droite de l'écran */}
      <div
        style={{
          position: 'fixed',
          top: '12px',
          right: '12px',
          display: 'flex',
          gap: '6px',
          fontSize: '9px',
          color: '#666',
          zIndex: 1000
        }}
      >
        {Object.entries(proxyStatuses).map(([name, status]) => (
          <div
            key={name}
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              padding: '3px 6px',
              color: 'white',
              backdropFilter: 'blur(4px)',
              borderRadius: '6px',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
            title={`${name}: ${status}`}
          >
            <span style={{ fontSize: '8px', opacity: 0.6, fontWeight: 500 }}>
              {name}
            </span>
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: getStatusColor(status),
                border:
                  status === 'loading'
                    ? '1px solid rgba(0, 0, 0, 0.2)'
                    : 'none',
                boxShadow:
                  status === 'loading'
                    ? 'inset 0 0 2px rgba(0, 0, 0, 0.2)'
                    : 'none'
              }}
            />
          </div>
        ))}
      </div>

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
    </>
  );
};

export default HomePage;
