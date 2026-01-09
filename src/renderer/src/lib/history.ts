import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface Transcription {
  id: string;
  text: string;
  timestamp: number;
  durationMs?: number; // Duration of the audio recording in milliseconds
  audioAmplitudes?: number[]; // Audio waveform amplitude data for visualization
}

export interface TranscriptionsByDay {
  date: string;
  transcriptions: Transcription[];
}

/**
 * Format a timestamp to relative time (e.g., "il y a 5 secondes")
 * or absolute date if too old
 */
export function formatRelativeTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = Date.now();
  const diff = now - timestamp;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  // If more than 7 days old, show absolute date
  if (days >= 7) {
    return format(date, 'd MMMM yyyy', { locale: fr });
  }

  // Otherwise, show relative time
  return formatDistanceToNow(date, { addSuffix: true, locale: fr });
}

/**
 * Group transcriptions by day
 */
export function groupTranscriptionsByDay(
  transcriptions: Transcription[]
): TranscriptionsByDay[] {
  const groups = new Map<string, Transcription[]>();

  transcriptions.forEach(transcription => {
    const date = new Date(transcription.timestamp);
    const dateKey = format(date, 'd MMMM yyyy', { locale: fr });

    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(transcription);
  });

  return Array.from(groups.entries()).map(([date, transcriptions]) => ({
    date,
    transcriptions
  }));
}

/**
 * Get a friendly day label (Aujourd'hui, Hier, or the date)
 */
export function getDayLabel(timestamp: number): string {
  const date = new Date(timestamp);

  if (isToday(date)) {
    return "Aujourd'hui";
  }
  if (isYesterday(date)) {
    return 'Hier';
  }

  return format(date, 'd MMMM yyyy', { locale: fr });
}
