/**
 * TEMPORARY MOCK DATA - DELETE THIS FILE AFTER TESTING
 *
 * Generates fake transcription data for testing chart variants
 */

import { format, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Transcription } from './history';

/**
 * Generate random text content for transcriptions
 */
function generateRandomText(): string {
  const phrases = [
    "Bonjour, je voudrais prendre rendez-vous pour la semaine prochaine",
    "Merci de me rappeler demain matin vers 9h",
    "Pourriez-vous m'envoyer le document par email s'il vous plaît",
    "J'ai une question concernant ma commande du mois dernier",
    "Je confirme notre réunion de demain à 14h30",
    "Pouvez-vous me donner plus d'informations sur ce produit",
    "Je souhaite annuler mon abonnement à partir du mois prochain",
    "Excellent travail sur le dernier projet, félicitations à toute l'équipe",
    "N'oubliez pas d'apporter les documents nécessaires",
    "Je vous remercie pour votre aide précieuse"
  ];

  // Random number of phrases (1-3)
  const count = Math.floor(Math.random() * 3) + 1;
  const selectedPhrases = [];

  for (let i = 0; i < count; i++) {
    selectedPhrases.push(phrases[Math.floor(Math.random() * phrases.length)]);
  }

  return selectedPhrases.join('. ') + '.';
}

/**
 * Generate mock transcriptions for the last N days
 */
export function generateMockTranscriptions(days: number = 30): Transcription[] {
  const transcriptions: Transcription[] = [];
  const now = Date.now();

  for (let i = 0; i < days; i++) {
    const date = subDays(new Date(), i);
    const dayStart = date.setHours(0, 0, 0, 0);

    // Random number of transcriptions per day (2-12)
    // More activity on weekdays
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const baseCount = isWeekend ? 2 : 5;
    const count = Math.floor(Math.random() * 8) + baseCount;

    for (let j = 0; j < count; j++) {
      // Random time during the day (8am to 8pm)
      const randomHour = Math.floor(Math.random() * 12) + 8;
      const randomMinute = Math.floor(Math.random() * 60);
      const randomSecond = Math.floor(Math.random() * 60);

      const timestamp = dayStart +
        (randomHour * 60 * 60 * 1000) +
        (randomMinute * 60 * 1000) +
        (randomSecond * 1000);

      transcriptions.push({
        id: `mock-${i}-${j}-${timestamp}`,
        text: generateRandomText(),
        timestamp
      });
    }
  }

  // Sort by timestamp (newest first)
  return transcriptions.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Enable/disable mock data (set to true for testing)
 */
export const USE_MOCK_DATA = true;
