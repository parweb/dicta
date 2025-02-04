import { Mic, MicOff } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

const apiKey =
  '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'

const HomePage = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [transcript, setTranscript] = useState('')

  const mediaRecorder = useRef(null)
  const audioChunks = useRef([])
  const transcriptRef = useRef(null)

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .catch((err) => console.error('Microphone access denied:', err))
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let xKeyIsDown = false

    document.addEventListener(
      'keydown',
      (e) => {
        if (e.key === 'x' && !xKeyIsDown) {
          xKeyIsDown = true
          console.log('keydown once', e.key)
          startRecording()
        }
      },
      { signal: controller.signal }
    )

    document.addEventListener(
      'keyup',
      (e) => {
        if (e.key === 'x') {
          xKeyIsDown = false
          console.log('keyup', e.key)
          stopRecording()
        }
      },
      { signal: controller.signal }
    )

    return () => {
      controller.abort()
    }
  }, [])

  useEffect(() => {
    if (transcript && transcriptRef.current) {
      const range = document.createRange()
      const selection = window.getSelection()
      range.selectNodeContents(transcriptRef.current)
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }, [transcript])

  const startRecording = async () => {
    console.log('startRecording')

    setIsRecording(true)
    audioChunks.current = []

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder.current = new MediaRecorder(stream)

    mediaRecorder.current.ondataavailable = (e) => {
      audioChunks.current.push(e.data)
    }

    mediaRecorder.current.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' })
      setAudioBlob(audioBlob)
      await transcribeAudio(audioBlob)
    }

    mediaRecorder.current.start()
  }

  const stopRecording = () => {
    console.log('stopRecording')
    if (mediaRecorder.current) {
      mediaRecorder.current.stop()
      setIsRecording(false)
    }
  }

  const transcribeAudio = async (blob) => {
    console.log('transcribeAudio')

    const formData = new FormData()
    formData.append('file', blob, 'recording.webm')
    formData.append('model', 'whisper-1')

    try {
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`
        },
        body: formData
      })

      const data = await response.json()
      setTranscript(data.text)
      navigator.clipboard.writeText(data.text)
    } catch (error) {
      console.error('Transcription error:', error)
    }
  }

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
        {isRecording ? <Mic /> : <MicOff />}
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
  )
}

export default HomePage
