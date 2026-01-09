import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  Brush,
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
import {
  calculateStatistics,
  formatCost,
  formatDuration,
  type UsageStatistics
} from '../lib/statistics';

const Statistics = () => {
  const [stats, setStats] = useState<UsageStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Custom CSS for Brush - magnifying glass effect with hidden travellers
  const brushStyles = `
    /* Remove container border */
    .statistics-chart .recharts-brush > rect:first-child {
      stroke: transparent !important;
    }

    /* Magnifying glass effect on brush slide */
    .statistics-chart .recharts-brush-slide {
      stroke: rgba(59, 130, 246, 0.6) !important;
      stroke-width: 2 !important;
      fill: rgba(59, 130, 246, 0.08) !important;
      rx: 4 !important;
      ry: 2.86 !important;
      transform: translateY(-15%) scaleY(1.4);
      transform-box: fill-box;
      transform-origin: center center;
    }

    /* Hide travellers visually but keep them interactive */
    .statistics-chart .recharts-brush-traveller,
    .statistics-chart .recharts-brush-traveller * {
      opacity: 0 !important;
      fill: transparent !important;
      stroke: transparent !important;
      outline: none !important;
    }

    .statistics-chart .recharts-brush-traveller:focus,
    .statistics-chart .recharts-brush-traveller:focus *,
    .statistics-chart .recharts-brush-traveller:hover,
    .statistics-chart .recharts-brush-traveller:hover *,
    .statistics-chart .recharts-brush-traveller:active,
    .statistics-chart .recharts-brush-traveller:active * {
      opacity: 0 !important;
      fill: transparent !important;
      stroke: transparent !important;
      outline: none !important;
    }

    .statistics-chart .recharts-brush-traveller {
      cursor: ew-resize !important;
    }
  `;

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
    return `rgba(59, 130, 246, ${0.3 + ratio * 0.7})`;
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
      <style>{brushStyles}</style>
      <div
        style={{
          padding: spacing['2xl'],
          width: '100%',
          maxWidth: '1200px',
          boxSizing: 'border-box'
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
                  Durée totale
                </div>
                <div
                  style={{
                    fontSize: typography.fontSize['2xl'],
                    fontWeight: typography.fontWeight.bold,
                    color: colors.text.primary
                  }}
                >
                  {formatDuration(stats.totalMinutes)}
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
                  Coût total
                </div>
                <div
                  style={{
                    fontSize: typography.fontSize['2xl'],
                    fontWeight: typography.fontWeight.bold,
                    color: colors.accent.blue.primary
                  }}
                >
                  {formatCost(stats.totalCost)}
                </div>
              </div>
            </div>

            {/* Chart */}
            {stats.dailyUsage.length > 0 && (
              <div
                style={
                  {
                    padding: spacing['2xl'],
                    WebkitAppRegion: 'no-drag'
                  } as React.CSSProperties
                }
              >
                <ResponsiveContainer
                  width="100%"
                  height={400}
                  className="statistics-chart"
                >
                  <BarChart
                    data={stats.dailyUsage}
                    margin={{ top: 30, right: 0, left: 0, bottom: 20 }}
                  >
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
                      cursor={false}
                      contentStyle={{
                        backgroundColor: colors.background.primary,
                        border: `1px solid ${colors.border.primary}`,
                        borderRadius: borderRadius.md,
                        fontSize: typography.fontSize.sm,
                        padding: spacing.md
                      }}
                      content={props => {
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
                            <div
                              style={{
                                fontSize: typography.fontSize.lg,
                                color: colors.accent.blue.primary,
                                fontWeight: typography.fontWeight.bold
                              }}
                            >
                              {formatCost(data.cost)}
                            </div>
                            <div
                              style={{
                                fontSize: typography.fontSize.sm,
                                color: colors.text.tertiary,
                                marginTop: '4px'
                              }}
                            >
                              {data.count} requêtes • {data.date}
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Bar
                      dataKey="minutes"
                      radius={[8, 8, 0, 0]}
                      shape={(props: any) => {
                        const { x, y, width, height, payload } = props;
                        return (
                          <rect
                            x={x}
                            y={y}
                            width={width}
                            height={height}
                            fill={getBarColor(payload.minutes)}
                            rx={8}
                            ry={8}
                          />
                        );
                      }}
                      label={{
                        position: 'top',
                        content: (props: any) => {
                          const cost =
                            stats.dailyUsage[props.index || 0]?.cost;
                          if (
                            (props.index || 0) %
                              Math.max(
                                1,
                                Math.floor(stats.dailyUsage.length / 5)
                              ) !==
                            0
                          )
                            return null;
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
                    <Brush
                      dataKey="date"
                      height={45}
                      stroke="transparent"
                      fill="transparent"
                      travellerWidth={6}
                      startIndex={Math.max(0, stats.dailyUsage.length - 30)}
                    >
                      <BarChart data={stats.dailyUsage} barCategoryGap="20%">
                        <Bar
                          dataKey="minutes"
                          fill="#3b82f6"
                          opacity={0.8}
                          maxBarSize={1}
                        />
                      </BarChart>
                    </Brush>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Statistics;
