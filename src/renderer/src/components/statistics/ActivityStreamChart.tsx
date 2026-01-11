import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { borderRadius, colors, spacing, typography } from '../../lib/design-system';
import { formatDuration } from '../../lib/statistics';
import type { UsageData } from '../../lib/statistics';

interface ActivityStreamChartProps {
  dailyUsage: UsageData[];
}

const ActivityStreamChart = ({ dailyUsage }: ActivityStreamChartProps) => {
  if (dailyUsage.length === 0) return null;

  // Aggregate data by 10-minute intervals for smoother curves
  const intervalMinutes = 10;
  const aggregated = new Map<string, { date: string; count: number; minutes: number; cost: number }>();

  dailyUsage.forEach(usage => {
    // Parse the date string format "12 Jan 14:30"
    const dateMatch = usage.date.match(/(\d{1,2})\s+(\w+)\s+(\d{1,2}):(\d{2})/);
    if (!dateMatch) return;

    const [, day, month, hour, minute] = dateMatch;
    const monthNum = ['jan', 'fév', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc']
      .findIndex(m => month.toLowerCase().startsWith(m));

    if (monthNum === -1) return;

    // Round to nearest interval
    const roundedMinute = Math.floor(parseInt(minute) / intervalMinutes) * intervalMinutes;

    const key = `${day} ${month} ${hour}:${String(roundedMinute).padStart(2, '0')}`;

    const existing = aggregated.get(key) || { date: key, count: 0, minutes: 0, cost: 0 };
    existing.count += usage.count;
    existing.minutes += usage.minutes;
    existing.cost += usage.cost;
    aggregated.set(key, existing);
  });

  const chartData = Array.from(aggregated.values());

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
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary,
            marginTop: spacing.xs
          }}
        >
          {formatDuration(data.minutes)} • ${data.cost.toFixed(4)}
        </div>
      </div>
    );
  };

  const maxCount = Math.max(...chartData.map(d => d.count), 1);

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
        Flux d'activité (par intervalles de {intervalMinutes} min)
      </h3>

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.accent.blue.primary} stopOpacity={0.8} />
              <stop offset="95%" stopColor={colors.accent.blue.primary} stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.accent.green.primary} stopOpacity={0.6} />
              <stop offset="95%" stopColor={colors.accent.green.primary} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            stroke={colors.text.tertiary}
            style={{ fontSize: typography.fontSize.xs }}
            axisLine={false}
            tickLine={false}
            interval={Math.floor(chartData.length / 6)}
          />
          <YAxis
            stroke={colors.text.tertiary}
            style={{ fontSize: typography.fontSize.xs }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: colors.accent.blue.primary, strokeWidth: 1 }} />
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

      {/* Stats summary */}
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
          <span style={{ color: colors.text.tertiary }}>Pic d'activité: </span>
          <span style={{ color: colors.accent.blue.primary, fontWeight: typography.fontWeight.semibold }}>
            {maxCount} requêtes
          </span>
        </div>
        <div>
          <span style={{ color: colors.text.tertiary }}>Total: </span>
          <span style={{ fontWeight: typography.fontWeight.semibold }}>
            {chartData.reduce((sum, d) => sum + d.count, 0)} requêtes
          </span>
        </div>
        <div>
          <span style={{ color: colors.text.tertiary }}>Durée: </span>
          <span style={{ fontWeight: typography.fontWeight.semibold }}>
            {formatDuration(chartData.reduce((sum, d) => sum + d.minutes, 0))}
          </span>
        </div>
      </div>

      {/* Alternative view: Minutes stream */}
      <div style={{ marginTop: spacing['3xl'] }}>
        <h4
          style={{
            fontSize: typography.fontSize.base,
            color: colors.text.secondary,
            marginBottom: spacing.lg,
            fontWeight: typography.fontWeight.medium
          }}
        >
          Vue par durée
        </h4>

        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="date"
              stroke={colors.text.tertiary}
              style={{ fontSize: typography.fontSize.xs }}
              axisLine={false}
              tickLine={false}
              interval={Math.floor(chartData.length / 6)}
            />
            <YAxis
              stroke={colors.text.tertiary}
              style={{ fontSize: typography.fontSize.xs }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: colors.accent.green.primary, strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="minutes"
              stroke={colors.accent.green.primary}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorMinutes)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ActivityStreamChart;
