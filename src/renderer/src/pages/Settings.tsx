import type { LucideIcon } from 'lucide-react';
import { Cloud, Download, Key, Palette } from 'lucide-react';
import { memo, useCallback, useState } from 'react';

import ThemeConfigurator from '@/components/design-system/ThemeConfigurator';
import BedrockSettings from '@/components/settings/BedrockSettings';
import ModelSettings from '@/components/settings/ModelSettings';
import UpdateSettings from '@/components/settings/UpdateSettings';
import { useThemeStore } from '@/hooks/useThemeStore';
import type { Theme } from '@/lib/theme-context';
import DesignSystem from './DesignSystem';

type TabValue = 'theme' | 'model' | 'bedrock' | 'updates';

interface TabButtonProps {
  label: string;
  icon: LucideIcon;
  value: TabValue;
  isActive: boolean;
  onClick: () => void;
  theme: Theme;
}

const TabButton = memo(
  ({ label, icon: Icon, isActive, onClick, theme }: TabButtonProps) => {
    const { colors, spacing, typography } = theme;

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!isActive) {
          e.currentTarget.style.color = colors.text.secondary;
        }
      },
      [isActive, colors.text.secondary]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!isActive) {
          e.currentTarget.style.color = colors.text.tertiary;
        }
      },
      [isActive, colors.text.tertiary]
    );

    return (
      <button
        onClick={onClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing.sm,
          padding: `${spacing.md}px ${spacing.lg}px`,
          backgroundColor: 'transparent',
          color: isActive ? colors.text.primary : colors.text.tertiary,
          border: 'none',
          borderBottom: isActive
            ? `2px solid ${colors.text.primary}`
            : '2px solid transparent',
          cursor: 'pointer',
          fontSize: typography.fontSize.sm,
          fontWeight: isActive
            ? typography.fontWeight.medium
            : typography.fontWeight.normal,
          marginBottom: '-1px',
          transition: 'color 0.15s'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Icon size={16} />
        <span>{label}</span>
      </button>
    );
  }
);

TabButton.displayName = 'TabButton';

interface SettingsProps {
  defaultTab?: TabValue;
}

const Settings = ({ defaultTab = 'theme' }: SettingsProps) => {
  const { theme } = useThemeStore();
  const { colors, spacing, typography } = theme;
  const [activeTab, setActiveTab] = useState<TabValue>(defaultTab);

  // Memoize tab click handlers
  const handleModelClick = useCallback(() => setActiveTab('model'), []);
  const handleBedrockClick = useCallback(() => setActiveTab('bedrock'), []);
  const handleThemeClick = useCallback(() => setActiveTab('theme'), []);
  const handleUpdatesClick = useCallback(() => setActiveTab('updates'), []);

  return (
    <div
      style={
        {
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
            <TabButton
              label="Modèle"
              icon={Key}
              value="model"
              isActive={activeTab === 'model'}
              onClick={handleModelClick}
              theme={theme}
            />
            <TabButton
              label="Bedrock"
              icon={Cloud}
              value="bedrock"
              isActive={activeTab === 'bedrock'}
              onClick={handleBedrockClick}
              theme={theme}
            />
            <TabButton
              label="Thème"
              icon={Palette}
              value="theme"
              isActive={activeTab === 'theme'}
              onClick={handleThemeClick}
              theme={theme}
            />
            <TabButton
              label="Mises à jour"
              icon={Download}
              value="updates"
              isActive={activeTab === 'updates'}
              onClick={handleUpdatesClick}
              theme={theme}
            />
          </div>
        </div>

        {/* Tab Content */}
        <div style={{ paddingTop: spacing.md }}>
          {activeTab === 'model' && <ModelSettings />}

          {activeTab === 'bedrock' && <BedrockSettings />}

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

          {activeTab === 'updates' && <UpdateSettings />}
        </div>
      </div>
    </div>
  );
};

export default Settings;
