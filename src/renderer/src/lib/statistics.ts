import { format, startOfMinute } from 'date-fns';
import { fr } from 'date-fns/locale';

import type { Transcription } from './history';

export interface UsageData {
  date: string;
  count: number;
  minutes: number;
  cost: number;
}

export interface UsageStatistics {
  totalTranscriptions: number;
  totalMinutes: number;
  totalCost: number;
  dailyUsage: UsageData[];
}

// OpenAI Whisper pricing: $0.006 per minute
const COST_PER_MINUTE = 0.006;

// Average speaking rate: ~150 words per minute
const WORDS_PER_MINUTE = 150;

/**
 * Estimate audio duration in minutes based on transcription text
 */
function estimateAudioDuration(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  return words / WORDS_PER_MINUTE;
}

/**
 * Calculate usage statistics from transcriptions
 */
export function calculateStatistics(
  transcriptions: Transcription[]
): UsageStatistics {
  const minuteMap = new Map<string, UsageData>();

  let totalMinutes = 0;

  transcriptions.forEach(transcription => {
    const minute = startOfMinute(new Date(transcription.timestamp));
    const minuteKey = format(minute, 'yyyy-MM-dd HH:mm');

    // Use real duration if available, otherwise estimate from text
    let durationMinutes = transcription.durationSeconds
      ? transcription.durationSeconds / 60
      : estimateAudioDuration(transcription.text || '');

    // Ensure we have a valid number
    if (!isFinite(durationMinutes) || durationMinutes < 0) {
      durationMinutes = 0;
    }

    totalMinutes += durationMinutes;

    if (!minuteMap.has(minuteKey)) {
      minuteMap.set(minuteKey, {
        date: format(minute, 'd MMM HH:mm', { locale: fr }),
        count: 0,
        minutes: 0,
        cost: 0
      });
    }

    const minuteData = minuteMap.get(minuteKey)!;
    minuteData.count += 1;
    minuteData.minutes += durationMinutes;
    minuteData.cost = minuteData.minutes * COST_PER_MINUTE;
  });

  // Sort by date (oldest to newest for chart)
  const dailyUsage = Array.from(minuteMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value);

  return {
    totalTranscriptions: transcriptions.length,
    totalMinutes,
    totalCost: totalMinutes * COST_PER_MINUTE,
    dailyUsage
  };
}

/**
 * Format cost in USD
 */
export function formatCost(cost: number): string {
  if (!isFinite(cost)) return '$0.00';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(cost);
}

/**
 * Format duration in minutes
 */
export function formatDuration(minutes: number): string {
  if (!isFinite(minutes) || minutes < 0) return '0s';
  if (minutes < 1) {
    const seconds = Math.round(minutes * 60);
    return `${seconds}s`;
  }
  if (minutes < 60) {
    return `${Math.round(minutes)}min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
}
