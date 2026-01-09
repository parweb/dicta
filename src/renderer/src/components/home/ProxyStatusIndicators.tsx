import type { ProxyStatus } from '../../hooks/useTranscriptionAPI';
import { components, getStatusColor, spacing, typography, colors } from '../../lib/design-system';

interface ProxyStatusIndicatorsProps {
  proxyStatuses: Record<string, ProxyStatus>;
}

const ProxyStatusIndicators = ({ proxyStatuses }: ProxyStatusIndicatorsProps) => {
  const proxyStatusEntries = Object.entries(proxyStatuses);

  return (
    <div
      style={{
        position: 'fixed',
        top: spacing.md,
        right: spacing.md,
        display: 'flex',
        gap: '6px',
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
              border:
                status === 'loading' ? '1px solid rgba(255, 255, 255, 0.3)' : 'none',
              boxShadow:
                status === 'loading' ? 'inset 0 0 2px rgba(0, 0, 0, 0.3)' : 'none'
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default ProxyStatusIndicators;
