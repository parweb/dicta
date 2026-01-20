import { useThemeStore } from '@/hooks/useThemeStore';

interface EmptyStateProps {
  message: string;
}

const EmptyState = ({ message }: EmptyStateProps) => {
  const { theme } = useThemeStore();
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
