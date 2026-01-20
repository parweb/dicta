import {
  PRESET_METADATA,
  PRESET_THEMES,
  type PresetName
} from '../../lib/theme-presets';
import { useThemeStore } from '@/hooks/useThemeStore';
import ThemePreviewCard from './ThemePreviewCard';

export default function PresetSelector() {
  const { theme, activePreset, replaceTheme, setActivePreset } = useThemeStore();

  const handlePresetClick = (presetName: PresetName) => {
    replaceTheme(PRESET_THEMES[presetName]);
    setActivePreset(presetName);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.lg
      }}
    >
      <h3
        style={{
          fontSize: theme.typography.fontSize.base,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.text.primary,
          margin: 0
        }}
      >
        Thèmes Prédéfinis
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: theme.spacing.lg
        }}
      >
        {(Object.keys(PRESET_THEMES) as PresetName[]).map(presetName => {
          const metadata = PRESET_METADATA[presetName];
          const presetTheme = PRESET_THEMES[presetName];
          const isActive = activePreset === presetName;

          return (
            <ThemePreviewCard
              key={presetName}
              preset={presetName}
              metadata={metadata}
              theme={presetTheme}
              isActive={isActive}
              onClick={() => handlePresetClick(presetName)}
            />
          );
        })}
      </div>

      {activePreset === 'custom' && (
        <div
          style={{
            padding: theme.spacing.md,
            backgroundColor: theme.colors.accent.warning.background,
            border: `1px solid ${theme.colors.accent.warning.primary}`,
            borderRadius: theme.borderRadius.sm,
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary
          }}
        >
          <strong style={{ color: theme.colors.accent.warning.primary }}>
            Thème personnalisé actif
          </strong>{' '}
          - Les modifications que vous apportez créent un thème personnalisé.
        </div>
      )}
    </div>
  );
}
