import { format, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

import type { Transcription } from './history';

export interface DailyUsage {
  date: string;
  count: number;
  estimatedMinutes: number;
  estimatedCost: number;
}

export interface UsageStatistics {
  totalTranscriptions: number;
  totalEstimatedMinutes: number;
  totalEstimatedCost: number;
  dailyUsage: DailyUsage[];
}

// OpenAI Whisper pricing: $0.006 per minute
const COST_PER_MINUTE = 0.006;

// Average speaking rate: ~150 words per minute
const WORDS_PER_MINUTE = 150;

/**
 * Estimate audio duration in minutes based on transcription text
 */
function estimateAudioDuration(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return words / WORDS_PER_MINUTE;
}

/**
 * Calculate usage statistics from transcriptions
 */
export function calculateStatistics(
  transcriptions: Transcription[]
): UsageStatistics {
  const dailyMap = new Map<string, DailyUsage>();

  let totalEstimatedMinutes = 0;

  transcriptions.forEach(transcription => {
    const date = startOfDay(new Date(transcription.timestamp));
    const dateKey = format(date, 'yyyy-MM-dd');
    const estimatedMinutes = estimateAudioDuration(transcription.text);

    totalEstimatedMinutes += estimatedMinutes;

    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, {
        date: format(date, 'd MMM', { locale: fr }),
        count: 0,
        estimatedMinutes: 0,
        estimatedCost: 0
      });
    }

    const daily = dailyMap.get(dateKey)!;
    daily.count += 1;
    daily.estimatedMinutes += estimatedMinutes;
    daily.estimatedCost = daily.estimatedMinutes * COST_PER_MINUTE;
  });

  // Sort by date (oldest to newest for chart)
  const dailyUsage = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value);

  return {
    totalTranscriptions: transcriptions.length,
    totalEstimatedMinutes,
    totalEstimatedCost: totalEstimatedMinutes * COST_PER_MINUTE,
    dailyUsage
  };
}

/**
 * Format cost in USD
 */
export function formatCost(cost: number): string {
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
