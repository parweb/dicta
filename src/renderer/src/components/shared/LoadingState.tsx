import { colors, spacing } from '../../lib/design-system';

interface LoadingStateProps {
  message?: string;
}

const LoadingState = ({ message = 'Chargement...' }: LoadingStateProps) => {
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

export default LoadingState;
