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
  const [brushRange, setBrushRange] = useState<{ startIndex: number; endIndex: number } | null>(null);

  // Custom CSS for Brush variants - remove container border, style selection differently
  const brushStyles = `
    /* Common: remove container border for all variants */
    .brush-variant-1 .recharts-brush > rect:first-child,
    .brush-variant-2 .recharts-brush > rect:first-child,
    .brush-variant-3 .recharts-brush > rect:first-child,
    .brush-variant-4 .recharts-brush > rect:first-child,
    .brush-variant-5 .recharts-brush > rect:first-child {
      stroke: transparent !important;
    }

    /* Variant 1: Invisible slide with color-changing bars */
    .brush-variant-1 .recharts-brush-slide {
      fill: transparent !important;
      stroke: transparent !important;
      cursor: move !important;
      pointer-events: all !important;
    }

    /* Hide travellers for variant 1 but keep them interactive */
    .brush-variant-1 .recharts-brush-traveller {
      cursor: ew-resize !important;
      pointer-events: all !important;
    }

    .brush-variant-1 .recharts-brush-traveller rect {
      fill: rgba(255, 255, 255, 0.15) !important;
      stroke: transparent !important;
      outline: none !important;
    }

    .brush-variant-1 .recharts-brush-traveller line {
      stroke: transparent !important;
    }

    .brush-variant-1 .recharts-brush-traveller:hover rect {
      fill: rgba(255, 255, 255, 0.25) !important;
    }

    /* Variant 2: Double border effect */
    .brush-variant-2 .recharts-brush-slide {
      stroke: #ec4899 !important;
      stroke-width: 1 !important;
      filter: drop-shadow(0 0 0 2px rgba(139, 92, 246, 0.4));
    }

    /* Variant 3: Magnifying glass effect */
    .brush-variant-3 .recharts-brush-slide {
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
    .brush-variant-3 .recharts-brush-traveller,
    .brush-variant-3 .recharts-brush-traveller * {
      opacity: 0 !important;
      fill: transparent !important;
      stroke: transparent !important;
      outline: none !important;
    }

    .brush-variant-3 .recharts-brush-traveller:focus,
    .brush-variant-3 .recharts-brush-traveller:focus *,
    .brush-variant-3 .recharts-brush-traveller:hover,
    .brush-variant-3 .recharts-brush-traveller:hover *,
    .brush-variant-3 .recharts-brush-traveller:active,
    .brush-variant-3 .recharts-brush-traveller:active * {
      opacity: 0 !important;
      fill: transparent !important;
      stroke: transparent !important;
      outline: none !important;
    }

    .brush-variant-3 .recharts-brush-traveller {
      cursor: ew-resize !important;
    }

    /* Variant 4: Thick border with inner shadow */
    .brush-variant-4 .recharts-brush-slide {
      stroke: #22d3ee !important;
      stroke-width: 3 !important;
      opacity: 0.8;
    }

    /* Variant 5: Rainbow gradient border */
    .brush-variant-5 .recharts-brush-slide {
      stroke: url(#rainbowGradient) !important;
      stroke-width: 3 !important;
      filter: drop-shadow(0 0 6px rgba(168, 85, 247, 0.5));
    }
  `;

  useEffect(() => {
    loadStatistics();
  }, []);

  // Initialize brush range when stats are loaded
  useEffect(() => {
    if (stats && stats.dailyUsage.length > 0 && !brushRange) {
      const startIndex = Math.max(0, stats.dailyUsage.length - 30);
      const endIndex = stats.dailyUsage.length - 1;
      setBrushRange({ startIndex, endIndex });
    }
  }, [stats, brushRange]);

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
      <style>{brushStyles}</style>
      <svg width="0" height="0">
        <defs>
          <linearGradient
            id="rainbowGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
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
              style={
                {
                  display: 'flex',
                  gap: spacing.sm,
                  justifyContent: 'center',
                  marginBottom: spacing.lg,
                  padding: spacing.md,
                  WebkitAppRegion: 'no-drag'
                } as React.CSSProperties
              }
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
                      e.currentTarget.style.borderColor =
                        colors.border.secondary;
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
                style={
                  {
                    padding: spacing['2xl'],
                    WebkitAppRegion: 'no-drag'
                  } as React.CSSProperties
                }
              >
                {/* Variant 1: Vertical gradient from dark to light blue */}
                {chartVariant === 1 && (
                  <ResponsiveContainer
                    width="100%"
                    height={400}
                    className="brush-variant-1"
                  >
                    <BarChart
                      data={stats.dailyUsage}
                      margin={{ top: 30, right: 0, left: 0, bottom: 20 }}
                    >
                      <defs>
                        <linearGradient
                          id="blueGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#1e3a8a"
                            stopOpacity={1}
                          />
                          <stop
                            offset="100%"
                            stopColor="#60a5fa"
                            stopOpacity={1}
                          />
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
                            const cost =
                              stats.dailyUsage[props.index || 0]?.estimatedCost;
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
                        travellerWidth={20}
                        startIndex={Math.max(0, stats.dailyUsage.length - 30)}
                        onChange={(range: any) => {
                          if (range && range.startIndex !== undefined && range.endIndex !== undefined) {
                            setBrushRange({ startIndex: range.startIndex, endIndex: range.endIndex });
                          }
                        }}
                      >
                        <BarChart data={stats.dailyUsage} barCategoryGap="20%">
                          <Bar
                            dataKey="count"
                            opacity={1}
                            maxBarSize={1}
                            shape={(props: any) => {
                              const { x, y, width, height, index } = props;
                              const isInRange = brushRange
                                ? index >= brushRange.startIndex && index <= brushRange.endIndex
                                : index >= Math.max(0, stats.dailyUsage.length - 30);
                              return (
                                <rect
                                  x={x}
                                  y={y}
                                  width={width}
                                  height={height}
                                  fill={isInRange ? '#ffffff' : '#60a5fa'}
                                />
                              );
                            }}
                          />
                        </BarChart>
                      </Brush>
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {/* Variant 2: Heat map with dynamic colors (low=blue, high=pink) */}
                {chartVariant === 2 && (
                  <ResponsiveContainer
                    width="100%"
                    height={400}
                    className="brush-variant-2"
                  >
                    <BarChart
                      data={stats.dailyUsage}
                      margin={{ top: 10, right: 0, left: 0, bottom: 20 }}
                    >
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
                                  fontSize: typography.fontSize.sm,
                                  color: colors.text.secondary,
                                  marginBottom: '4px'
                                }}
                              >
                                {data.date}
                              </div>
                              <div
                                style={{
                                  fontSize: typography.fontSize.base,
                                  color: colors.text.primary,
                                  fontWeight: typography.fontWeight.semibold
                                }}
                              >
                                {data.count} requêtes
                              </div>
                              <div
                                style={{
                                  fontSize: typography.fontSize.lg,
                                  color: colors.accent.blue.primary,
                                  fontWeight: typography.fontWeight.bold,
                                  marginTop: '4px'
                                }}
                              >
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
                        height={45}
                        stroke="transparent"
                        fill="transparent"
                        travellerWidth={6}
                        startIndex={Math.max(0, stats.dailyUsage.length - 30)}
                      >
                        <BarChart data={stats.dailyUsage} barCategoryGap="20%">
                          <Bar
                            dataKey="count"
                            fill="#ec4899"
                            opacity={0.8}
                            maxBarSize={1}
                          />
                        </BarChart>
                      </Brush>
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {/* Variant 3: Opacity-based (same color, varying opacity) */}
                {chartVariant === 3 && (
                  <ResponsiveContainer
                    width="100%"
                    height={400}
                    className="brush-variant-3"
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
                                {formatCost(data.estimatedCost)}
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
                            const cost =
                              stats.dailyUsage[props.index || 0]?.estimatedCost;
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
                            dataKey="count"
                            fill="#3b82f6"
                            opacity={0.8}
                            maxBarSize={1}
                          />
                        </BarChart>
                      </Brush>
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {/* Variant 4: Green to blue gradient based on value */}
                {chartVariant === 4 && (
                  <ResponsiveContainer
                    width="100%"
                    height={400}
                    className="brush-variant-4"
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
                        tick={false}
                      />
                      <YAxis hide />
                      <Tooltip
                        cursor={false}
                        contentStyle={{
                          backgroundColor: 'transparent',
                          border: 'none'
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
                        height={45}
                        stroke="transparent"
                        fill="transparent"
                        travellerWidth={6}
                        startIndex={Math.max(0, stats.dailyUsage.length - 30)}
                      >
                        <BarChart data={stats.dailyUsage} barCategoryGap="20%">
                          <Bar
                            dataKey="count"
                            fill="#22d3ee"
                            opacity={0.8}
                            maxBarSize={1}
                          />
                        </BarChart>
                      </Brush>
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {/* Variant 5: Dual-tone gradient (dark bottom, light top) */}
                {chartVariant === 5 && (
                  <ResponsiveContainer
                    width="100%"
                    height={400}
                    className="brush-variant-5"
                  >
                    <BarChart
                      data={stats.dailyUsage}
                      margin={{ top: 30, right: 0, left: 0, bottom: 20 }}
                      barGap={2}
                    >
                      <defs>
                        <linearGradient
                          id="dualGradient"
                          x1="0"
                          y1="1"
                          x2="0"
                          y2="0"
                        >
                          <stop
                            offset="0%"
                            stopColor="#1e40af"
                            stopOpacity={1}
                          />
                          <stop
                            offset="100%"
                            stopColor="#7dd3fc"
                            stopOpacity={1}
                          />
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
                        content={props => {
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
                              <div
                                style={{
                                  fontSize: typography.fontSize.xl,
                                  color: colors.accent.blue.primary,
                                  fontWeight: typography.fontWeight.bold
                                }}
                              >
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
                        height={45}
                        stroke="transparent"
                        fill="transparent"
                        travellerWidth={6}
                        startIndex={Math.max(0, stats.dailyUsage.length - 30)}
                      >
                        <BarChart data={stats.dailyUsage} barCategoryGap="20%">
                          <Bar
                            dataKey="count"
                            fill="#a855f7"
                            opacity={0.8}
                            maxBarSize={1}
                          />
                        </BarChart>
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
