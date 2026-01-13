import { useState } from 'react';
import { Palette, Key } from 'lucide-react';

import ThemeConfigurator from '../components/design-system/ThemeConfigurator';
import ModelSettings from '../components/settings/ModelSettings';
import { useTheme } from '../lib/theme-context';
import DesignSystem from './DesignSystem';

interface SettingsProps {
  defaultTab?: 'theme' | 'model';
}

const Settings = ({ defaultTab = 'theme' }: SettingsProps) => {
  const { theme } = useTheme();
  const { colors, spacing, typography } = theme;
  const [activeTab, setActiveTab] = useState<'theme' | 'model'>(defaultTab);

  return (
    <div
      style={
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitAppRegion: 'no-drag'
        } as React.CSSProperties
      }
    >
      <div
        style={{
          padding: spacing['2xl'],
          maxWidth: '1200px',
          margin: '0 auto',
          paddingBottom: spacing['4xl']
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: spacing['3xl']
          }}
        >
          <h1
            style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              marginBottom: spacing.sm
            }}
          >
            Paramètres
          </h1>
          <p
            style={{
              fontSize: typography.fontSize.base,
              color: colors.text.tertiary,
              lineHeight: typography.lineHeight.relaxed
            }}
          >
            Configurez l'apparence et le comportement de Dicta
          </p>
        </div>

        {/* Custom Tabs */}
        <div style={{ marginBottom: spacing['3xl'] }}>
          <div
            style={{
              display: 'flex',
              gap: spacing.xs,
              borderBottom: `1px solid ${colors.border.primary}`
            }}
          >
            <button
              onClick={() => setActiveTab('model')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.sm,
                padding: `${spacing.md}px ${spacing.lg}px`,
                backgroundColor: 'transparent',
                color:
                  activeTab === 'model'
                    ? colors.text.primary
                    : colors.text.tertiary,
                border: 'none',
                borderBottom:
                  activeTab === 'model'
                    ? `2px solid ${colors.text.primary}`
                    : '2px solid transparent',
                cursor: 'pointer',
                fontSize: typography.fontSize.sm,
                fontWeight:
                  activeTab === 'model'
                    ? typography.fontWeight.medium
                    : typography.fontWeight.normal,
                marginBottom: '-1px',
                transition: 'color 0.15s'
              }}
              onMouseEnter={e => {
                if (activeTab !== 'model') {
                  e.currentTarget.style.color = colors.text.secondary;
                }
              }}
              onMouseLeave={e => {
                if (activeTab !== 'model') {
                  e.currentTarget.style.color = colors.text.tertiary;
                }
              }}
            >
              <Key size={16} />
              <span>Modèle</span>
            </button>

            <button
              onClick={() => setActiveTab('theme')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.sm,
                padding: `${spacing.md}px ${spacing.lg}px`,
                backgroundColor: 'transparent',
                color:
                  activeTab === 'theme'
                    ? colors.text.primary
                    : colors.text.tertiary,
                border: 'none',
                borderBottom:
                  activeTab === 'theme'
                    ? `2px solid ${colors.text.primary}`
                    : '2px solid transparent',
                cursor: 'pointer',
                fontSize: typography.fontSize.sm,
                fontWeight:
                  activeTab === 'theme'
                    ? typography.fontWeight.medium
                    : typography.fontWeight.normal,
                marginBottom: '-1px',
                transition: 'color 0.15s'
              }}
              onMouseEnter={e => {
                if (activeTab !== 'theme') {
                  e.currentTarget.style.color = colors.text.secondary;
                }
              }}
              onMouseLeave={e => {
                if (activeTab !== 'theme') {
                  e.currentTarget.style.color = colors.text.tertiary;
                }
              }}
            >
              <Palette size={16} />
              <span>Thème</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div style={{ paddingTop: spacing.md }}>
          {activeTab === 'model' && <ModelSettings />}

          {activeTab === 'theme' && (
            <>
              {/* Theme Configurator */}
              <div style={{ marginBottom: spacing['4xl'] }}>
                <ThemeConfigurator />
              </div>

              {/* Live Preview */}
              <div style={{ marginBottom: spacing['4xl'] }}>
                <h2
                  style={{
                    fontSize: typography.fontSize.xl,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.text.primary,
                    marginBottom: spacing.sm
                  }}
                >
                  Aperçu en Direct
                </h2>
                <p
                  style={{
                    fontSize: typography.fontSize.base,
                    color: colors.text.tertiary,
                    lineHeight: typography.lineHeight.relaxed,
                    marginBottom: spacing['2xl']
                  }}
                >
                  Les changements de thème sont appliqués immédiatement
                  ci-dessous
                </p>
                <DesignSystem />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
