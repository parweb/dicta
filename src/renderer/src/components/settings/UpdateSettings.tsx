import { useState } from 'react';
import { Download, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

import { useUpdate } from '../../lib/update-context';
import { useTheme } from '../../lib/theme-context';
import { Button } from '../ui/button';

export default function UpdateSettings() {
  const { theme } = useTheme();
  const { colors, spacing, typography } = theme;
  const {
    currentVersion,
    channel,
    updateInfo,
    progress,
    lastCheckTime,
    setChannel,
    checkForUpdates
  } = useUpdate();

  const [isCheckingManually, setIsCheckingManually] = useState(false);

  const handleChannelChange = async (newChannel: 'stable' | 'beta') => {
    const success = await setChannel(newChannel);
    if (!success) {
      console.error('Failed to change channel');
    }
  };

  const handleManualCheck = async () => {
    setIsCheckingManually(true);
    await checkForUpdates();
    // Reset after 2 seconds
    setTimeout(() => setIsCheckingManually(false), 2000);
  };

  const getStatusIcon = () => {
    switch (updateInfo.status) {
      case 'checking':
        return <RefreshCw size={16} color={colors.text.tertiary} className="animate-spin" />;
      case 'downloading':
        return <Download size={16} color={colors.accent.blue.primary} />;
      case 'ready':
        return <CheckCircle2 size={16} color={colors.accent.green.primary} />;
      case 'up-to-date':
        return <CheckCircle2 size={16} color={colors.accent.green.primary} />;
      case 'error':
        return <AlertCircle size={16} color={colors.state.error} />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (updateInfo.status) {
      case 'downloading':
        return colors.accent.blue.primary;
      case 'ready':
      case 'up-to-date':
        return colors.accent.green.primary;
      case 'error':
        return colors.state.error;
      default:
        return colors.text.secondary;
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '480px' }}>
      {/* Header */}
      <div style={{ marginBottom: spacing['4xl'] }}>
        <h2
          style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.medium,
            color: colors.text.primary,
            margin: 0,
            marginBottom: spacing.xs
          }}
        >
          Mises à jour
        </h2>
        <p
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.tertiary,
            margin: 0
          }}
        >
          Gestion automatique des mises à jour
        </p>
      </div>

      {/* Current Version */}
      <div style={{ marginBottom: spacing['2xl'] }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: spacing.lg,
            backgroundColor: `${colors.background.secondary}40` as string,
            borderRadius: '2px',
            marginBottom: spacing.md
          } as React.CSSProperties}
        >
          <span
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.tertiary
            }}
          >
            Version actuelle
          </span>
          <span
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.primary,
              fontWeight: typography.fontWeight.medium,
              fontFamily: 'monospace'
            }}
          >
            v{currentVersion}
          </span>
        </div>

        {/* Update Status */}
        {updateInfo.status !== 'idle' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
              padding: spacing.md,
              backgroundColor: `${colors.background.secondary}20` as string,
              borderRadius: '2px',
              border: `1px solid ${colors.border.primary}`
            } as React.CSSProperties}
          >
            {getStatusIcon()}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: typography.fontSize.sm,
                  color: getStatusColor(),
                  fontWeight: typography.fontWeight.medium
                }}
              >
                {updateInfo.message}
              </div>
              {progress && updateInfo.status === 'downloading' && (
                <div
                  style={{
                    marginTop: spacing.xs,
                    height: '4px',
                    backgroundColor: colors.background.tertiary,
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      width: `${progress.percent}%`,
                      height: '100%',
                      backgroundColor: colors.accent.blue.primary,
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Update Channel */}
      <div style={{ marginBottom: spacing['2xl'] }}>
        <label
          style={{
            display: 'block',
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary,
            marginBottom: spacing.sm,
            fontWeight: typography.fontWeight.medium
          }}
        >
          Canal de mise à jour
        </label>
        <div style={{ display: 'flex', gap: spacing.sm }}>
          <button
            onClick={() => handleChannelChange('stable')}
            style={{
              flex: 1,
              padding: spacing.md,
              backgroundColor: (
                channel === 'stable'
                  ? colors.background.secondary
                  : `${colors.background.secondary}20`
              ) as string,
              border: `1px solid ${channel === 'stable' ? colors.text.primary : colors.border.primary}`,
              borderRadius: '2px',
              color: channel === 'stable' ? colors.text.primary : colors.text.tertiary,
              fontSize: typography.fontSize.sm,
              fontWeight:
                channel === 'stable'
                  ? typography.fontWeight.medium
                  : typography.fontWeight.normal,
              cursor: 'pointer',
              transition: 'all 0.15s'
            } as React.CSSProperties}
          >
            Stable
          </button>
          <button
            onClick={() => handleChannelChange('beta')}
            style={{
              flex: 1,
              padding: spacing.md,
              backgroundColor: (
                channel === 'beta'
                  ? colors.background.secondary
                  : `${colors.background.secondary}20`
              ) as string,
              border: `1px solid ${channel === 'beta' ? colors.text.primary : colors.border.primary}`,
              borderRadius: '2px',
              color: channel === 'beta' ? colors.text.primary : colors.text.tertiary,
              fontSize: typography.fontSize.sm,
              fontWeight:
                channel === 'beta'
                  ? typography.fontWeight.medium
                  : typography.fontWeight.normal,
              cursor: 'pointer',
              transition: 'all 0.15s'
            } as React.CSSProperties}
          >
            Beta
          </button>
        </div>
        <p
          style={{
            fontSize: typography.fontSize.xs,
            color: colors.text.tertiary,
            margin: 0,
            marginTop: spacing.sm
          }}
        >
          {channel === 'stable'
            ? 'Versions stables testées et fiables'
            : 'Accès anticipé aux nouvelles fonctionnalités'}
        </p>
      </div>

      {/* Last Check Time */}
      {lastCheckTime && (
        <div style={{ marginBottom: spacing['2xl'] }}>
          <p
            style={{
              fontSize: typography.fontSize.xs,
              color: colors.text.tertiary,
              margin: 0
            }}
          >
            Dernière vérification:{' '}
            {formatDistanceToNow(lastCheckTime, {
              addSuffix: true,
              locale: fr
            })}
          </p>
        </div>
      )}

      {/* Manual Check Button */}
      <Button
        onClick={handleManualCheck}
        disabled={isCheckingManually || updateInfo.status === 'checking'}
        size="sm"
        variant="outline"
      >
        {isCheckingManually || updateInfo.status === 'checking'
          ? 'Vérification...'
          : 'Vérifier maintenant'}
      </Button>

      {/* Info Text */}
      <div
        style={{
          marginTop: spacing['2xl'],
          padding: spacing.lg,
          backgroundColor: `${colors.background.secondary}20` as string,
          borderRadius: '2px',
          border: `1px solid ${colors.border.primary}`
        } as React.CSSProperties}
      >
        <p
          style={{
            fontSize: typography.fontSize.xs,
            color: colors.text.tertiary,
            margin: 0,
            lineHeight: '1.5'
          }}
        >
          Les mises à jour sont vérifiées automatiquement toutes les 4 heures.
          Elles se téléchargent en arrière-plan et s'installent au prochain
          démarrage de l'application.
        </p>
      </div>
    </div>
  );
}
