import EmptyState from '@/components/shared/EmptyState';
import LoadingState from '@/components/shared/LoadingState';
import DailyTimelineGridChart from '@/components/statistics/DailyTimelineGridChart';
import StatsSummaryCards from '@/components/statistics/StatsSummaryCards';
import { spacing } from '@/lib/design-system';
import type { Transcription } from '@/lib/history';
import { calculateStatistics } from '@/lib/statistics';
import { useCallback, useEffect, useMemo, useState } from 'react';

const Statistics = () => {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Memoize expensive statistics calculation
  const stats = useMemo(() => {
    if (transcriptions.length === 0) return null;
    return calculateStatistics(transcriptions);
  }, [transcriptions]);

  // Memoize load statistics function
  const loadStatistics = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await window.api?.history.loadAll();
      if (result?.success && result.transcriptions) {
        const trans = result.transcriptions as Transcription[];
        setTranscriptions(trans);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) {
        setIsDropdownOpen(false);
      }
    };

    // Add listener with a small delay to avoid closing immediately
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflowY: 'auto',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          padding: spacing['2xl'],
          width: '100%',
          maxWidth: '1200px',
          boxSizing: 'border-box'
        }}
      >
        {isLoading ? (
          <LoadingState message="Chargement des statistiques..." />
        ) : !stats || stats.totalTranscriptions === 0 ? (
          <EmptyState message="Aucune donnée disponible. Commencez par créer des transcriptions !" />
        ) : (
          <>
            <StatsSummaryCards
              totalTranscriptions={stats.totalTranscriptions}
              totalMinutes={stats.totalMinutes}
              totalCost={stats.totalCost}
            />

            <DailyTimelineGridChart transcriptions={transcriptions} />
          </>
        )}
      </div>
    </div>
  );
};

export default Statistics;
