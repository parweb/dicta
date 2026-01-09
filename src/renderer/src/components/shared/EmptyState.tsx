import { colors, spacing } from '../../lib/design-system';

interface EmptyStateProps {
  message: string;
}

const EmptyState = ({ message }: EmptyStateProps) => {
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
