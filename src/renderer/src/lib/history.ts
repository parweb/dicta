export interface Transcription {
  id: string;
  text: string;
  timestamp: number;
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
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  // Less than 1 minute
  if (seconds < 60) {
    return `il y a ${seconds} seconde${seconds > 1 ? 's' : ''}`;
  }

  // Less than 1 hour
  if (minutes < 60) {
    return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  }

  // Less than 24 hours
  if (hours < 24) {
    return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  }

  // Less than 7 days
  if (days < 7) {
    return `il y a ${days} jour${days > 1 ? 's' : ''}`;
  }

  // More than 7 days, show absolute date
  const date = new Date(timestamp);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
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
    const dateKey = date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

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
 * Check if a date is today
 */
export function isToday(timestamp: number): boolean {
  const date = new Date(timestamp);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is yesterday
 */
export function isYesterday(timestamp: number): boolean {
  const date = new Date(timestamp);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
}

/**
 * Get a friendly day label (Aujourd'hui, Hier, or the date)
 */
export function getDayLabel(timestamp: number): string {
  if (isToday(timestamp)) {
    return "Aujourd'hui";
  }
  if (isYesterday(timestamp)) {
    return 'Hier';
  }
  const date = new Date(timestamp);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}
