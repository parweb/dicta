import { useMemo } from 'react';
import {
  Area,
  AreaChart,
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
} from '../../lib/design-system';
import type { Transcription } from '../../lib/history';

interface SimpleActivityStreamChartProps {
  transcriptions: Transcription[];
}

const SimpleActivityStreamChart = ({
  transcriptions
}: SimpleActivityStreamChartProps) => {
  // Aggregate by hour
  const hourlyData = useMemo(() => {
    const dataMap = new Map<
      string,
      { time: string; count: number; totalDuration: number }
    >();

    transcriptions.forEach(t => {
      const date = new Date(t.timestamp);
      const hourKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${String(date.getHours()).padStart(2, '0')}`;
      const timeLabel = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}h`;

      const existing = dataMap.get(hourKey) || {
        time: timeLabel,
        count: 0,
        totalDuration: 0
      };
      existing.count += 1;
      existing.totalDuration += t.durationMs || 0;
      dataMap.set(hourKey, existing);
    });

    return Array.from(dataMap.values()).sort((a, b) =>
      a.time.localeCompare(b.time)
    );
  }, [transcriptions]);

  if (hourlyData.length === 0) return null;

  const maxCount = Math.max(...hourlyData.map(d => d.count), 1);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null;

    const data = payload[0].payload;

    return (
      <div
        style={{
          backgroundColor: colors.background.primary,
          border: `1px solid ${colors.border.primary}`,
          borderRadius: borderRadius.md,
          padding: spacing.md,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
        }}
      >
        <div
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.tertiary,
            marginBottom: spacing.xs
          }}
        >
          {data.time}
        </div>
        <div
          style={{
            fontSize: typography.fontSize.base,
            color: colors.text.primary,
            fontWeight: typography.fontWeight.semibold
          }}
        >
          {data.count} transcriptions
        </div>
        <div
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary,
            marginTop: spacing.xs
          }}
        >
          Durée: {(data.totalDuration / 1000).toFixed(1)}s
        </div>
      </div>
    );
  };

  return (
    <div
      style={
        {
          padding: spacing['2xl'],
          WebkitAppRegion: 'no-drag'
        } as React.CSSProperties
      }
    >
      <h3
        style={{
          fontSize: typography.fontSize.lg,
          color: colors.text.primary,
          marginBottom: spacing.lg,
          fontWeight: typography.fontWeight.semibold
        }}
      >
        Flux d'activité (par heure)
      </h3>

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={hourlyData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={colors.accent.blue.primary}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={colors.accent.blue.primary}
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            stroke={colors.text.tertiary}
            style={{ fontSize: typography.fontSize.xs }}
            axisLine={false}
            tickLine={false}
            interval={Math.max(0, Math.floor(hourlyData.length / 8))}
          />
          <YAxis
            stroke={colors.text.tertiary}
            style={{ fontSize: typography.fontSize.xs }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: colors.accent.blue.primary, strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke={colors.accent.blue.primary}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorCount)"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Stats */}
      <div
        style={{
          marginTop: spacing.lg,
          display: 'flex',
          gap: spacing['2xl'],
          fontSize: typography.fontSize.sm,
          color: colors.text.secondary
        }}
      >
        <div>
          <span style={{ color: colors.text.tertiary }}>Pic: </span>
          <span
            style={{
              color: colors.accent.blue.primary,
              fontWeight: typography.fontWeight.semibold
            }}
          >
            {maxCount} transcriptions/heure
          </span>
        </div>
        <div>
          <span style={{ color: colors.text.tertiary }}>Total: </span>
          <span style={{ fontWeight: typography.fontWeight.semibold }}>
            {hourlyData.reduce((sum, d) => sum + d.count, 0)} transcriptions
          </span>
        </div>
      </div>
    </div>
  );
};

export default SimpleActivityStreamChart;
