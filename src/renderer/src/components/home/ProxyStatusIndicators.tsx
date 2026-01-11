import type { ProxyStatus } from '../../hooks/useTranscriptionAPI';
import {
  components,
  getStatusColor,
  spacing,
  typography,
  colors,
  borders,
  shadows
} from '../../lib/design-system';

interface ProxyStatusIndicatorsProps {
  proxyStatuses: Record<string, ProxyStatus>;
}

const ProxyStatusIndicators = ({
  proxyStatuses
}: ProxyStatusIndicatorsProps) => {
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
              backgroundColor: getStatusColor(status),
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
