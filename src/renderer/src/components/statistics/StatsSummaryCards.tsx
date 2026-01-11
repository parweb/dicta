import { useTheme } from '../../lib/theme-context';
import { formatCost, formatDuration } from '../../lib/statistics';

interface StatsSummaryCardsProps {
  totalTranscriptions: number;
  totalMinutes: number;
  totalCost: number;
}

const StatsSummaryCards = ({
  totalTranscriptions,
  totalMinutes,
  totalCost
}: StatsSummaryCardsProps) => {
  const { theme } = useTheme();
  const { colors, spacing, typography } = theme;

  return (
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
          {totalTranscriptions}
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
          {formatDuration(totalMinutes)}
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
          {formatCost(totalCost)}
        </div>
      </div>
    </div>
  );
};

export default StatsSummaryCards;
