import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import {
  borderRadius,
  colors,
  spacing,
  typography
} from '../lib/design-system';
import type { Transcription } from '../lib/history';
import { generateMockTranscriptions, USE_MOCK_DATA } from '../lib/mockData';
import {
  calculateStatistics,
  formatCost,
  formatDuration,
  type UsageStatistics
} from '../lib/statistics';

interface StatisticsProps {
  onBack: () => void;
}

const Statistics = ({ onBack }: StatisticsProps) => {
  const [stats, setStats] = useState<UsageStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartVariant, setChartVariant] = useState<1 | 2 | 3 | 4 | 5>(1);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    setIsLoading(true);
    try {
      // TEMPORARY: Use mock data for testing
      if (USE_MOCK_DATA) {
        const mockTranscriptions = generateMockTranscriptions(30);
        const statistics = calculateStatistics(mockTranscriptions);
        setStats(statistics);
      } else {
        const result = await window.api?.history.loadAll();
        if (result?.success && result.transcriptions) {
          const transcriptions = result.transcriptions as Transcription[];
          const statistics = calculateStatistics(transcriptions);
          setStats(statistics);
        }
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
        flexDirection: 'column',
        backgroundColor: colors.background.primary,
        WebkitAppRegion: 'no-drag'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: spacing.xl,
          borderBottom: `1px solid ${colors.border.primary}`,
          display: 'flex',
          alignItems: 'center',
          gap: spacing.md
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: spacing.sm,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: borderRadius.md,
            color: colors.text.secondary,
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1
          style={{
            margin: 0,
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary
          }}
        >
          Statistiques d'utilisation
        </h1>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: spacing['2xl'],
          width: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {isLoading ? (
          <div
            style={{
              textAlign: 'center',
              padding: spacing['4xl'],
              color: colors.text.tertiary
            }}
          >
            Chargement des statistiques...
          </div>
        ) : !stats || stats.totalTranscriptions === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: spacing['4xl'],
              color: colors.text.tertiary
            }}
          >
            Aucune donnée disponible. Commencez par créer des transcriptions !
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: spacing.lg,
                marginBottom: spacing['3xl']
              }}
            >
              <div
                style={{
                  padding: spacing.xl
                }}
              >
                <div
                  style={{
                    fontSize: typography.fontSize.base,
                    color: colors.text.tertiary,
                    marginBottom: spacing.sm
                  }}
                >
                  Total de requêtes
                </div>
                <div
                  style={{
                    fontSize: typography.fontSize['2xl'],
                    fontWeight: typography.fontWeight.bold,
                    color: colors.text.primary
                  }}
                >
                  {stats.totalTranscriptions}
                </div>
              </div>

              <div
                style={{
                  padding: spacing.xl
                }}
              >
                <div
                  style={{
                    fontSize: typography.fontSize.base,
                    color: colors.text.tertiary,
                    marginBottom: spacing.sm
                  }}
                >
                  Durée estimée
                </div>
                <div
                  style={{
                    fontSize: typography.fontSize['2xl'],
                    fontWeight: typography.fontWeight.bold,
                    color: colors.text.primary
                  }}
                >
                  {formatDuration(stats.totalEstimatedMinutes)}
                </div>
              </div>

              <div
                style={{
                  padding: spacing.xl
                }}
              >
                <div
                  style={{
                    fontSize: typography.fontSize.base,
                    color: colors.accent.blue.light,
                    marginBottom: spacing.sm
                  }}
                >
                  Coût estimé
                </div>
                <div
                  style={{
                    fontSize: typography.fontSize['2xl'],
                    fontWeight: typography.fontWeight.bold,
                    color: colors.accent.blue.primary
                  }}
                >
                  {formatCost(stats.totalEstimatedCost)}
                </div>
              </div>
            </div>

            {/* TEMPORARY: Chart Variant Selector */}
            <div
              style={{
                display: 'flex',
                gap: spacing.sm,
                justifyContent: 'center',
                marginBottom: spacing.lg,
                padding: spacing.md
              }}
            >
              {([1, 2, 3, 4, 5] as const).map(variant => (
                <button
                  key={variant}
                  onClick={() => setChartVariant(variant)}
                  style={{
                    padding: `${spacing.sm} ${spacing.lg}`,
                    backgroundColor:
                      chartVariant === variant
                        ? colors.accent.blue.primary
                        : 'transparent',
                    color:
                      chartVariant === variant
                        ? colors.text.primary
                        : colors.text.tertiary,
                    border: `1px solid ${
                      chartVariant === variant
                        ? colors.accent.blue.primary
                        : colors.border.primary
                    }`,
                    borderRadius: borderRadius.md,
                    cursor: 'pointer',
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    if (chartVariant !== variant) {
                      e.currentTarget.style.borderColor = colors.border.secondary;
                    }
                  }}
                  onMouseLeave={e => {
                    if (chartVariant !== variant) {
                      e.currentTarget.style.borderColor = colors.border.primary;
                    }
                  }}
                >
                  Variante {variant}
                </button>
              ))}
            </div>

            {/* Chart */}
            {stats.dailyUsage.length > 0 && (
              <div
                style={{
                  padding: spacing['2xl']
                }}
              >
                {/* Variant 1: Minimal bars with price on top */}
                {chartVariant === 1 && (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.dailyUsage} margin={{ top: 30, right: 0, left: 0, bottom: 0 }}>
                      <XAxis
                        dataKey="date"
                        stroke={colors.text.tertiary}
                        style={{ fontSize: typography.fontSize.xs }}
                        axisLine={false}
                        tickLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis hide />
                      <Tooltip
                        cursor={false}
                        contentStyle={{
                          backgroundColor: colors.background.primary,
                          border: `1px solid ${colors.border.primary}`,
                          borderRadius: borderRadius.md,
                          fontSize: typography.fontSize.sm,
                          color: colors.text.secondary
                        }}
                        formatter={(value: number, name: string) => {
                          if (name === 'count') return [value, 'Requêtes'];
                          if (name === 'estimatedCost')
                            return [formatCost(value), 'Coût'];
                          return [value, name];
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill={colors.accent.blue.primary}
                        radius={[6, 6, 0, 0]}
                        label={{
                          position: 'top',
                          content: (props: any) => {
                            const cost = stats.dailyUsage[props.index || 0]?.estimatedCost;
                            return (
                              <text
                                x={(props.x || 0) + (props.width || 0) / 2}
                                y={(props.y || 0) - 5}
                                fill={colors.text.tertiary}
                                fontSize={typography.fontSize.xs}
                                textAnchor="middle"
                              >
                                {formatCost(cost || 0)}
                              </text>
                            );
                          }
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {/* Variant 2: Clean bars with hover only */}
                {chartVariant === 2 && (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.dailyUsage} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                      <XAxis
                        dataKey="date"
                        stroke={colors.text.tertiary}
                        style={{ fontSize: typography.fontSize.xs }}
                        axisLine={false}
                        tickLine={false}
                        interval={Math.floor(stats.dailyUsage.length / 5)}
                      />
                      <YAxis hide />
                      <Tooltip
                        cursor={{ fill: colors.accent.blue.background }}
                        contentStyle={{
                          backgroundColor: colors.background.primary,
                          border: `1px solid ${colors.border.primary}`,
                          borderRadius: borderRadius.md,
                          fontSize: typography.fontSize.sm,
                          color: colors.text.secondary,
                          padding: spacing.md
                        }}
                        content={(props) => {
                          if (!props.active || !props.payload?.[0]) return null;
                          const data = props.payload[0].payload;
                          return (
                            <div
                              style={{
                                backgroundColor: colors.background.primary,
                                border: `1px solid ${colors.border.primary}`,
                                borderRadius: borderRadius.md,
                                padding: spacing.md
                              }}
                            >
                              <div style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, marginBottom: '4px' }}>
                                {data.date}
                              </div>
                              <div style={{ fontSize: typography.fontSize.base, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>
                                {data.count} requêtes
                              </div>
                              <div style={{ fontSize: typography.fontSize.lg, color: colors.accent.blue.primary, fontWeight: typography.fontWeight.bold, marginTop: '4px' }}>
                                {formatCost(data.estimatedCost)}
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill={colors.accent.blue.primary}
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {/* Variant 3: Simple bars with price label */}
                {chartVariant === 3 && (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.dailyUsage} margin={{ top: 30, right: 0, left: 0, bottom: 0 }}>
                      <XAxis
                        dataKey="date"
                        stroke={colors.text.tertiary}
                        style={{ fontSize: typography.fontSize.xs }}
                        axisLine={false}
                        tickLine={false}
                        interval={Math.floor(stats.dailyUsage.length / 4)}
                      />
                      <YAxis hide />
                      <Tooltip
                        cursor={{ fill: colors.accent.blue.background }}
                        contentStyle={{
                          backgroundColor: colors.background.primary,
                          border: `1px solid ${colors.border.primary}`,
                          borderRadius: borderRadius.md,
                          fontSize: typography.fontSize.sm,
                          padding: spacing.md
                        }}
                        content={(props) => {
                          if (!props.active || !props.payload?.[0]) return null;
                          const data = props.payload[0].payload;
                          return (
                            <div
                              style={{
                                backgroundColor: colors.background.primary,
                                border: `1px solid ${colors.border.primary}`,
                                borderRadius: borderRadius.md,
                                padding: spacing.md
                              }}
                            >
                              <div style={{ fontSize: typography.fontSize.lg, color: colors.accent.blue.primary, fontWeight: typography.fontWeight.bold }}>
                                {formatCost(data.estimatedCost)}
                              </div>
                              <div style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary, marginTop: '4px' }}>
                                {data.count} requêtes • {data.date}
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Bar
                        dataKey="count"
                        radius={[8, 8, 0, 0]}
                        fill={colors.accent.blue.primary}
                        label={{
                          position: 'top',
                          content: (props: any) => {
                            const cost = stats.dailyUsage[props.index || 0]?.estimatedCost;
                            if ((props.index || 0) % Math.max(1, Math.floor(stats.dailyUsage.length / 5)) !== 0) return null;
                            return (
                              <text
                                x={(props.x || 0) + (props.width || 0) / 2}
                                y={(props.y || 0) - 5}
                                fill={colors.text.tertiary}
                                fontSize={typography.fontSize.xs}
                                textAnchor="middle"
                              >
                                {formatCost(cost || 0)}
                              </text>
                            );
                          }
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {/* Variant 4: Ultra minimal - no axes */}
                {chartVariant === 4 && (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.dailyUsage} margin={{ top: 30, right: 0, left: 0, bottom: 0 }}>
                      <XAxis
                        dataKey="date"
                        stroke={colors.text.tertiary}
                        style={{ fontSize: typography.fontSize.xs }}
                        axisLine={false}
                        tickLine={false}
                        tick={false}
                      />
                      <YAxis hide />
                      <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{
                          backgroundColor: 'transparent',
                          border: 'none'
                        }}
                        content={(props) => {
                          if (!props.active || !props.payload?.[0]) return null;
                          const data = props.payload[0].payload;
                          return (
                            <div
                              style={{
                                backgroundColor: colors.background.primary,
                                border: `1px solid ${colors.border.primary}`,
                                borderRadius: borderRadius.md,
                                padding: spacing.sm,
                                fontSize: typography.fontSize.sm,
                                color: colors.text.primary,
                                fontWeight: typography.fontWeight.semibold
                              }}
                            >
                              {formatCost(data.estimatedCost)}
                            </div>
                          );
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill={colors.accent.blue.primary}
                        radius={[8, 8, 0, 0]}
                        maxBarSize={50}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {/* Variant 5: Compact bars with overlay price on hover */}
                {chartVariant === 5 && (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.dailyUsage} margin={{ top: 30, right: 0, left: 0, bottom: 0 }} barGap={2}>
                      <XAxis
                        dataKey="date"
                        stroke={colors.text.tertiary}
                        style={{ fontSize: typography.fontSize.xs }}
                        axisLine={false}
                        tickLine={false}
                        interval={Math.floor(stats.dailyUsage.length / 6)}
                      />
                      <YAxis hide />
                      <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{
                          backgroundColor: 'transparent',
                          border: 'none'
                        }}
                        content={(props) => {
                          if (!props.active || !props.payload?.[0]) return null;
                          const data = props.payload[0].payload;
                          return (
                            <div
                              style={{
                                backgroundColor: colors.background.primary,
                                border: `2px solid ${colors.accent.blue.primary}`,
                                borderRadius: borderRadius.lg,
                                padding: spacing.md,
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
                              }}
                            >
                              <div style={{ fontSize: typography.fontSize.xl, color: colors.accent.blue.primary, fontWeight: typography.fontWeight.bold }}>
                                {formatCost(data.estimatedCost)}
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill={colors.accent.blue.primary}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Statistics;
