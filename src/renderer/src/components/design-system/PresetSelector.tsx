import {
  PRESET_METADATA,
  PRESET_THEMES,
  type PresetName
} from '../../lib/theme-presets';
import { useTheme } from '../../lib/theme-context';

export default function PresetSelector() {
  const { theme, activePreset, replaceTheme, setActivePreset } = useTheme();

  const handlePresetClick = (presetName: PresetName) => {
    replaceTheme(PRESET_THEMES[presetName]);
    setActivePreset(presetName);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.md
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: theme.spacing.md
        }}
      >
        {(Object.keys(PRESET_THEMES) as PresetName[]).map(presetName => {
          const metadata = PRESET_METADATA[presetName];
          const isActive = activePreset === presetName;

          return (
            <button
              key={presetName}
              onClick={() => handlePresetClick(presetName)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: theme.spacing.sm,
                padding: theme.spacing.lg,
                backgroundColor: isActive
                  ? theme.colors.accent.blue.background
                  : theme.colors.background.secondary,
                border: `2px solid ${isActive ? theme.colors.border.accent : theme.colors.border.primary}`,
                borderRadius: theme.borderRadius.md,
                cursor: 'pointer',
                transition: 'all 0.2s',
                outline: 'none'
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor =
                    theme.colors.background.tertiary;
                  e.currentTarget.style.borderColor =
                    theme.colors.border.secondary;
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor =
                    theme.colors.background.secondary;
                  e.currentTarget.style.borderColor =
                    theme.colors.border.primary;
                }
              }}
            >
              <span
                style={{
                  fontSize: theme.typography.fontSize.xl,
                  lineHeight: '1'
                }}
              >
                {metadata.icon}
              </span>

              <div
                style={{
                  textAlign: 'center'
                }}
              >
                <div
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: isActive
                      ? theme.colors.accent.blue.primary
                      : theme.colors.text.primary,
                    marginBottom: theme.spacing.xs
                  }}
                >
                  {metadata.name}
                </div>

                <div
                  style={{
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.text.tertiary,
                    lineHeight: theme.typography.lineHeight.tight
                  }}
                >
                  {metadata.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {activePreset === 'custom' && (
        <div
          style={{
            padding: theme.spacing.md,
            backgroundColor: theme.colors.accent.yellow.background,
            border: `1px solid ${theme.colors.accent.yellow.primary}`,
            borderRadius: theme.borderRadius.sm,
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary
          }}
        >
          <strong style={{ color: theme.colors.accent.yellow.primary }}>
            Thème personnalisé actif
          </strong>{' '}
          - Les modifications que vous apportez créent un thème personnalisé.
        </div>
      )}
    </div>
  );
}
