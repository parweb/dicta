import { memo, useMemo } from 'react';

import type { ProxyStatus } from '../../hooks/useTranscriptionAPI';
import { useTheme } from '../../lib/theme-context';
import { getStatusColor } from '../../lib/theme-utils';

interface ProxyStatusIndicatorsProps {
  proxyStatuses: Record<string, ProxyStatus>;
}

interface ProxyStatusIndicatorProps {
  name: string;
  status: ProxyStatus;
}

const ProxyStatusIndicator = memo(
  ({ name, status }: ProxyStatusIndicatorProps) => {
    const { theme, baseConfig } = useTheme();
    const { spacing, typography, borders, shadows, components } = theme;

    return (
      <div
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
    );
  }
);

ProxyStatusIndicator.displayName = 'ProxyStatusIndicator';

const ProxyStatusIndicators = memo(
  ({ proxyStatuses }: ProxyStatusIndicatorsProps) => {
    const { theme } = useTheme();
    const { spacing, typography, colors } = theme;

    const proxyStatusEntries = useMemo(
      () => Object.entries(proxyStatuses),
      [proxyStatuses]
    );

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
          <ProxyStatusIndicator key={name} name={name} status={status} />
        ))}
      </div>
    );
  }
);

ProxyStatusIndicators.displayName = 'ProxyStatusIndicators';

export default ProxyStatusIndicators;
