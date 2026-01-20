/**
 * Audio Analyzer
 * Extract audio duration and amplitude data using Web Audio API
 */

/**
 * Analyze audio blob to extract duration and amplitude data
 */
export async function analyzeAudio(
  blob: Blob
): Promise<{ durationMs?: number; amplitudes: number[] }> {
  try {
    const arrayBuffer = await blob.arrayBuffer()
    const audioContext = new AudioContext()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

    // Extract audio samples from first channel
    const channelData = audioBuffer.getChannelData(0)
    const samples = channelData.length
    const durationMs = audioBuffer.duration * 1000 // Convert to milliseconds for precision

    // Calculate amplitudes for visualization (divide into ~200 segments)
    const segmentCount = Math.min(200, Math.floor(samples / 100))
    const samplesPerSegment = Math.floor(samples / segmentCount)
    const amplitudes: number[] = []

    for (let i = 0; i < segmentCount; i++) {
      const start = i * samplesPerSegment
      const end = start + samplesPerSegment
      let sum = 0

      // Calculate RMS (Root Mean Square) for this segment
      for (let j = start; j < end && j < samples; j++) {
        sum += channelData[j] * channelData[j]
      }

      const rms = Math.sqrt(sum / samplesPerSegment)
      amplitudes.push(rms)
    }

    await audioContext.close()
    return { durationMs, amplitudes }
  } catch (error) {
    console.error('Error analyzing audio:', error)
    return { amplitudes: [] }
  }
}
