import { BarChart3, Grid3x3 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import EmptyState from '../components/shared/EmptyState';
import LoadingState from '../components/shared/LoadingState';
import HeatmapChart from '../components/statistics/HeatmapChart';
import StatsSummaryCards from '../components/statistics/StatsSummaryCards';
import UsageChart from '../components/statistics/UsageChart';
import { borderRadius, colors, spacing, charts, components, typography } from '../lib/design-system';
import type { Transcription } from '../lib/history';
import { calculateStatistics, type UsageStatistics } from '../lib/statistics';

const Statistics = () => {
  const [stats, setStats] = useState<UsageStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartType, setChartType] = useState<'bar' | 'heatmap'>('bar');

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

  // Calculate relative values for opacity-based coloring (based on duration)
  const maxMinutes = useMemo(() => {
    if (!stats || stats.dailyUsage.length === 0) return 0;
    return Math.max(...stats.dailyUsage.map(d => d.minutes));
  }, [stats]);

  const getBarColor = (minutes: number) => {
    if (maxMinutes === 0) return colors.accent.blue.primary;
    const ratio = minutes / maxMinutes;
    // Opacity-based: same color, varying opacity
    return `rgba(${charts.bar.rgb}, ${0.3 + ratio * 0.7})`;
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
            {/* Toggle button for chart type */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: spacing.lg,
                gap: spacing.sm,
                WebkitAppRegion: 'no-drag'
              } as React.CSSProperties}
            >
              <button
                onClick={() => setChartType('bar')}
                style={{
                  ...components.button.base,
                  padding: spacing.md,
                  backgroundColor: chartType === 'bar' ? colors.accent.blue.background : 'transparent',
                  border: `1px solid ${chartType === 'bar' ? colors.accent.blue.primary : colors.border.primary}`,
                  borderRadius: borderRadius.md,
                  color: chartType === 'bar' ? colors.accent.blue.primary : colors.text.secondary,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.xs
                }}
                title="Vue en barres"
              >
                <BarChart3 size={16} />
                <span>Barres</span>
              </button>
              <button
                onClick={() => setChartType('heatmap')}
                style={{
                  ...components.button.base,
                  padding: spacing.md,
                  backgroundColor: chartType === 'heatmap' ? colors.accent.blue.background : 'transparent',
                  border: `1px solid ${chartType === 'heatmap' ? colors.accent.blue.primary : colors.border.primary}`,
                  borderRadius: borderRadius.md,
                  color: chartType === 'heatmap' ? colors.accent.blue.primary : colors.text.secondary,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.xs
                }}
                title="Vue heatmap"
              >
                <Grid3x3 size={16} />
                <span>Heatmap</span>
              </button>
            </div>

            <StatsSummaryCards
              totalTranscriptions={stats.totalTranscriptions}
              totalMinutes={stats.totalMinutes}
              totalCost={stats.totalCost}
            />

            {chartType === 'bar' ? (
              <UsageChart dailyUsage={stats.dailyUsage} getBarColor={getBarColor} />
            ) : (
              <HeatmapChart dailyUsage={stats.dailyUsage} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Statistics;
