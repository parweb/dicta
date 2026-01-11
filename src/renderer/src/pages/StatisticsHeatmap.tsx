import { useEffect, useState } from 'react';

import EmptyState from '../components/shared/EmptyState';
import LoadingState from '../components/shared/LoadingState';
import HeatmapChart from '../components/statistics/HeatmapChart';
import StatsSummaryCards from '../components/statistics/StatsSummaryCards';
import { spacing } from '../lib/design-system';
import type { Transcription } from '../lib/history';
import { calculateStatistics, type UsageStatistics } from '../lib/statistics';

const StatisticsHeatmap = () => {
  const [stats, setStats] = useState<UsageStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    setIsLoading(true);
    try {
      const result = await window.api?.history.loadAll();
      if (result?.success && result.transcriptions) {
        const transcriptions = result.transcriptions as Transcription[];
        const statistics = calculateStatistics(transcriptions);
        setStats(statistics);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
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
            <HeatmapChart dailyUsage={stats.dailyUsage} />
          </>
        )}
      </div>
    </div>
  );
};

export default StatisticsHeatmap;
