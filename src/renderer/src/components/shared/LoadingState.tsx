import { useThemeStore } from '@/hooks/useThemeStore';

interface LoadingStateProps {
  message?: string;
}

const LoadingState = ({ message = 'Chargement...' }: LoadingStateProps) => {
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

export default LoadingState;
