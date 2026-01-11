import { useTheme } from '../../lib/theme-context';

interface EmptyStateProps {
  message: string;
}

const EmptyState = ({ message }: EmptyStateProps) => {
  const { theme } = useTheme();
  const { colors, spacing } = theme;

  return (
    <div
      style={{
        textAlign: 'center',
        padding: spacing.xl,
        color: colors.text.tertiary
      }}
    >
      {message}
    </div>
  );
};

export default EmptyState;
