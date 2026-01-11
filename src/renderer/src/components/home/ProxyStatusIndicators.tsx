import type { ProxyStatus } from '../../hooks/useTranscriptionAPI';
import { useTheme } from '../../lib/theme-context';
import { getStatusColor } from '../../lib/theme-utils';

interface ProxyStatusIndicatorsProps {
  proxyStatuses: Record<string, ProxyStatus>;
}

const ProxyStatusIndicators = ({
  proxyStatuses
}: ProxyStatusIndicatorsProps) => {
  const { theme, baseConfig } = useTheme();
  const { spacing, typography, colors, borders, shadows, components } = theme;
  const proxyStatusEntries = Object.entries(proxyStatuses);

  return (
    <div
      style={{
        position: 'fixed',
        top: spacing.md,
        right: spacing.md,
        display: 'flex',
        gap: spacing.sm,
        fontSize: typography.fontSize.xs,
        color: colors.text.tertiary,
        zIndex: 3
      }}
    >
      {proxyStatusEntries.map(([name, status]) => (
        <div
          key={name}
          style={{
            ...components.proxyIndicator.container,
            display: 'flex',
            gap: spacing.md,
            alignItems: 'center'
          }}
          title={`${name}: ${status}`}
        >
          <span
            style={{
              fontSize: typography.fontSize.xs,
              opacity: 0.8,
              fontWeight: typography.fontWeight.medium
            }}
          >
            {name}
          </span>
          <div
            style={{
              ...components.proxyIndicator.dot,
              backgroundColor: getStatusColor(status, baseConfig),
              border: status === 'loading' ? borders.medium : 'none',
              boxShadow: status === 'loading' ? shadows.inner : 'none'
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default ProxyStatusIndicators;
