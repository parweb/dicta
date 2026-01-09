import { borderRadius, colors, spacing, typography } from '../../lib/design-system';
import { formatCost, formatDuration } from '../../lib/statistics';

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
}

const ChartTooltip = ({ active, payload }: ChartTooltipProps) => {
  if (!active || !payload?.[0]) return null;

  const data = payload[0].payload;

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
          color: colors.text.tertiary,
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
        {data.count} requêtes • {formatDuration(data.minutes)}
      </div>
      <div
        style={{
          fontSize: typography.fontSize.lg,
          color: colors.accent.blue.primary,
          fontWeight: typography.fontWeight.bold,
          marginTop: '4px'
        }}
      >
        {formatCost(data.cost)}
      </div>
    </div>
  );
};

export default ChartTooltip;
