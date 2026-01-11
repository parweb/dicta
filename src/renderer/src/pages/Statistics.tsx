import { ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import EmptyState from '../components/shared/EmptyState';
import LoadingState from '../components/shared/LoadingState';
import SimpleHourlyChart from '../components/statistics/SimpleHourlyChart';
import StatsSummaryCards from '../components/statistics/StatsSummaryCards';
import UsageChart from '../components/statistics/UsageChart';
import { borderRadius, colors, spacing, charts, components, typography } from '../lib/design-system';
import type { Transcription } from '../lib/history';
import { calculateStatistics, type UsageStatistics } from '../lib/statistics';

type ChartType = 'bar' | 'hourly';

const chartOptions: { value: ChartType; label: string; description: string }[] = [
  { value: 'bar', label: 'Graphique à barres', description: 'Vue classique avec barres par minute' },
  { value: 'hourly', label: 'Heatmap horaire', description: 'Activité par heure et par jour (30 jours)' }
];

const Statistics = () => {
  const [stats, setStats] = useState<UsageStatistics | null>(null);
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    setIsLoading(true);
    try {
      const result = await window.api?.history.loadAll();
      if (result?.success && result.transcriptions) {
        const trans = result.transcriptions as Transcription[];
        setTranscriptions(trans);
        const statistics = calculateStatistics(trans);
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
            {/* Dropdown for chart type selection */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: spacing.lg,
                WebkitAppRegion: 'no-drag',
                position: 'relative'
              } as React.CSSProperties}
            >
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{
                  ...components.button.base,
                  padding: spacing.md,
                  backgroundColor: colors.background.secondary,
                  border: `1px solid ${colors.border.primary}`,
                  borderRadius: borderRadius.md,
                  color: colors.text.primary,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.md,
                  minWidth: '250px',
                  justifyContent: 'space-between'
                }}
              >
                <span>{chartOptions.find(o => o.value === chartType)?.label}</span>
                <ChevronDown
                  size={16}
                  style={{
                    transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                  }}
                />
              </button>

              {/* Dropdown menu */}
              {isDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: spacing.xs,
                    backgroundColor: colors.background.secondary,
                    border: `1px solid ${colors.border.primary}`,
                    borderRadius: borderRadius.md,
                    minWidth: '300px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                    zIndex: 1000,
                    overflow: 'hidden'
                  }}
                >
                  {chartOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setChartType(option.value);
                        setIsDropdownOpen(false);
                      }}
                      style={{
                        ...components.button.base,
                        width: '100%',
                        padding: spacing.md,
                        backgroundColor: chartType === option.value ? colors.accent.blue.background : 'transparent',
                        border: 'none',
                        borderBottom: `1px solid ${colors.border.primary}`,
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: spacing.xs,
                        cursor: 'pointer'
                      }}
                    >
                      <div
                        style={{
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.medium,
                          color: chartType === option.value ? colors.accent.blue.primary : colors.text.primary
                        }}
                      >
                        {option.label}
                      </div>
                      <div
                        style={{
                          fontSize: typography.fontSize.xs,
                          color: colors.text.tertiary
                        }}
                      >
                        {option.description}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <StatsSummaryCards
              totalTranscriptions={stats.totalTranscriptions}
              totalMinutes={stats.totalMinutes}
              totalCost={stats.totalCost}
            />

            {/* Render selected chart */}
            {chartType === 'bar' && (
              <UsageChart dailyUsage={stats.dailyUsage} getBarColor={getBarColor} />
            )}
            {chartType === 'hourly' && (
              <SimpleHourlyChart transcriptions={transcriptions} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Statistics;
