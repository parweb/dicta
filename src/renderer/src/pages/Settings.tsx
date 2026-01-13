import { Palette, Key } from 'lucide-react';

import ThemeConfigurator from '../components/design-system/ThemeConfigurator';
import ModelSettings from '../components/settings/ModelSettings';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '../components/ui/tabs';
import { useTheme } from '../lib/theme-context';
import DesignSystem from './DesignSystem';

interface SettingsProps {
  defaultTab?: 'theme' | 'model';
}

const Settings = ({ defaultTab = 'theme' }: SettingsProps) => {
  const { theme } = useTheme();
  const { colors, spacing, typography } = theme;

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

        {/* Settings Tabs */}
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList
            style={{
              marginBottom: spacing['2xl']
            }}
          >
            <TabsTrigger value="model">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.sm
                }}
              >
                <Key size={16} />
                <span>Modèle</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="theme">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.sm
                }}
              >
                <Palette size={16} />
                <span>Thème</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="model">
            <ModelSettings />
          </TabsContent>

          <TabsContent value="theme">
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
                Les changements de thème sont appliqués immédiatement ci-dessous
              </p>
              <DesignSystem />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
