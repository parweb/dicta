import { useEffect, useState, useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Brush,
  Line,
  LineChart,
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

const Statistics = () => {
  const [stats, setStats] = useState<UsageStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartVariant, setChartVariant] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Custom CSS for Brush variant 3 - remove container border but keep selection border
  const brushVariant3Style = `
    .brush-variant-3 .recharts-brush > rect:first-child {
      stroke: transparent !important;
    }
    .brush-variant-3 .recharts-brush-slide {
      stroke: #3b82f6 !important;
    }
  `;

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    setIsLoading(true);
    try {
      // TEMPORARY: Use mock data for testing
      if (USE_MOCK_DATA) {
        const mockTranscriptions = generateMockTranscriptions(365);
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

  // Calculate relative values for gradient effects
  const maxCount = useMemo(() => {
    if (!stats || stats.dailyUsage.length === 0) return 0;
    return Math.max(...stats.dailyUsage.map(d => d.count));
  }, [stats]);

  const getGradientColor = (count: number, variant: number) => {
    if (maxCount === 0) return colors.accent.blue.primary;
    const ratio = count / maxCount;

    switch (variant) {
      case 1:
        // Vertical gradient from dark to light blue
        return `url(#blueGradient)`;
      case 2:
        // Heat map: low (blue) -> medium (purple) -> high (pink)
        const r = Math.floor(59 + ratio * 196); // 59 -> 255
        const g = Math.floor(130 - ratio * 70); // 130 -> 60
        const b = Math.floor(246 - ratio * 94); // 246 -> 152
        return `rgb(${r}, ${g}, ${b})`;
      case 3:
        // Opacity-based: same color, varying opacity
        return `rgba(59, 130, 246, ${0.3 + ratio * 0.7})`;
      case 4:
        // Green to blue gradient based on value
        const green = Math.floor(134 * (1 - ratio));
        const blue = Math.floor(187 + ratio * 59);
        return `rgb(34, ${green}, ${blue})`;
      case 5:
        // Dual-tone gradient
        return `url(#dualGradient)`;
      default:
        return colors.accent.blue.primary;
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
      <style>{brushVariant3Style}</style>
      <div style={{ padding: spacing['2xl'], width: '100%', maxWidth: '1200px', boxSizing: 'border-box' }}>
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
                padding: spacing.md,
                WebkitAppRegion: 'no-drag'
              } as React.CSSProperties}
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
                  padding: spacing['2xl'],
                  WebkitAppRegion: 'no-drag'
                } as React.CSSProperties}
              >
                {/* Variant 1: Vertical gradient from dark to light blue */}
                {chartVariant === 1 && (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={stats.dailyUsage} margin={{ top: 30, right: 0, left: 0, bottom: 20 }}>
                      <defs>
                        <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#1e3a8a" stopOpacity={1} />
                          <stop offset="100%" stopColor="#60a5fa" stopOpacity={1} />
                        </linearGradient>
                      </defs>
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
                        fill="url(#blueGradient)"
                        radius={[8, 8, 0, 0]}
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
                      <Brush
                        dataKey="date"
                        height={40}
                        stroke="#60a5fa"
                        fill="transparent"
                        travellerWidth={8}
                        startIndex={Math.max(0, stats.dailyUsage.length - 30)}
                      >
                        <LineChart data={stats.dailyUsage}>
                          <Line type="monotone" dataKey="count" stroke="#60a5fa" strokeWidth={1} dot={false} />
                        </LineChart>
                      </Brush>
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {/* Variant 2: Heat map with dynamic colors (low=blue, high=pink) */}
                {chartVariant === 2 && (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={stats.dailyUsage} margin={{ top: 10, right: 0, left: 0, bottom: 20 }}>
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
                        cursor={false}
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
                        radius={[8, 8, 0, 0]}
                        shape={(props: any) => {
                          const { x, y, width, height, payload } = props;
                          return (
                            <rect
                              x={x}
                              y={y}
                              width={width}
                              height={height}
                              fill={getGradientColor(payload.count, 2)}
                              rx={8}
                              ry={8}
                            />
                          );
                        }}
                      />
                      <Brush
                        dataKey="date"
                        height={50}
                        stroke="#ec4899"
                        fill="transparent"
                        travellerWidth={12}
                        startIndex={Math.max(0, stats.dailyUsage.length - 30)}
                      >
                        <AreaChart data={stats.dailyUsage}>
                          <defs>
                            <linearGradient id="brushGradient2" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#ec4899" stopOpacity={0.6} />
                              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.1} />
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="count" stroke="#ec4899" strokeWidth={2} fill="url(#brushGradient2)" />
                        </AreaChart>
                      </Brush>
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {/* Variant 3: Opacity-based (same color, varying opacity) */}
                {chartVariant === 3 && (
                  <ResponsiveContainer width="100%" height={400} className="brush-variant-3">
                    <BarChart data={stats.dailyUsage} margin={{ top: 30, right: 0, left: 0, bottom: 20 }}>
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
                        shape={(props: any) => {
                          const { x, y, width, height, payload } = props;
                          return (
                            <rect
                              x={x}
                              y={y}
                              width={width}
                              height={height}
                              fill={getGradientColor(payload.count, 3)}
                              rx={8}
                              ry={8}
                            />
                          );
                        }}
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
                      <Brush
                        dataKey="date"
                        height={45}
                        stroke="transparent"
                        fill="transparent"
                        travellerWidth={6}
                        startIndex={Math.max(0, stats.dailyUsage.length - 30)}
                      >
                        <BarChart data={stats.dailyUsage} barCategoryGap="20%">
                          <Bar dataKey="count" fill="#3b82f6" opacity={0.8} maxBarSize={1} />
                        </BarChart>
                      </Brush>
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {/* Variant 4: Green to blue gradient based on value */}
                {chartVariant === 4 && (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={stats.dailyUsage} margin={{ top: 30, right: 0, left: 0, bottom: 20 }}>
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
                        cursor={false}
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
                        radius={[8, 8, 0, 0]}
                        maxBarSize={50}
                        shape={(props: any) => {
                          const { x, y, width, height, payload } = props;
                          return (
                            <rect
                              x={x}
                              y={y}
                              width={width}
                              height={height}
                              fill={getGradientColor(payload.count, 4)}
                              rx={8}
                              ry={8}
                            />
                          );
                        }}
                      />
                      <Brush
                        dataKey="date"
                        height={40}
                        stroke="#22d3ee"
                        fill="#1e293b"
                        travellerWidth={14}
                        startIndex={Math.max(0, stats.dailyUsage.length - 30)}
                      >
                        <LineChart data={stats.dailyUsage}>
                          <Line
                            type="monotone"
                            dataKey="count"
                            stroke="none"
                            dot={{ fill: '#22d3ee', r: 2 }}
                            activeDot={false}
                          />
                        </LineChart>
                      </Brush>
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {/* Variant 5: Dual-tone gradient (dark bottom, light top) */}
                {chartVariant === 5 && (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={stats.dailyUsage} margin={{ top: 30, right: 0, left: 0, bottom: 20 }} barGap={2}>
                      <defs>
                        <linearGradient id="dualGradient" x1="0" y1="1" x2="0" y2="0">
                          <stop offset="0%" stopColor="#1e40af" stopOpacity={1} />
                          <stop offset="100%" stopColor="#7dd3fc" stopOpacity={1} />
                        </linearGradient>
                      </defs>
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
                        cursor={false}
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
                        fill="url(#dualGradient)"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                      />
                      <Brush
                        dataKey="date"
                        height={48}
                        stroke="#a855f7"
                        fill="transparent"
                        travellerWidth={10}
                        startIndex={Math.max(0, stats.dailyUsage.length - 30)}
                      >
                        <AreaChart data={stats.dailyUsage}>
                          <defs>
                            <linearGradient id="brushGradient5" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8} />
                              <stop offset="50%" stopColor="#a855f7" stopOpacity={0.8} />
                              <stop offset="100%" stopColor="#ec4899" stopOpacity={0.8} />
                            </linearGradient>
                          </defs>
                          <Area
                            type="monotone"
                            dataKey="count"
                            stroke="url(#brushGradient5)"
                            strokeWidth={3}
                            fill="url(#brushGradient5)"
                            fillOpacity={0.2}
                          />
                        </AreaChart>
                      </Brush>
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
