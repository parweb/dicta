import { Palette, Type, Ruler } from 'lucide-react';

import { useTheme } from '../../lib/theme-context';
import ColorPicker from './ColorPicker';

const VisualEditor = () => {
  const { theme, setTheme } = useTheme();
  const { colors, spacing, typography } = theme;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing['4xl']
      }}
    >
      {/* Colors Section */}
      <Section
        icon={<Palette size={20} />}
        title="Couleurs"
        description="Personnalisez la palette de couleurs de l'application"
      >
        {/* Background Colors */}
        <SubSection title="Couleurs de Fond">
          <ColorGrid>
            <ColorPicker
              label="Primaire"
              value={colors.background.primary}
              onChange={value =>
                setTheme({ colors: { background: { primary: value } } })
              }
            />
            <ColorPicker
              label="Secondaire"
              value={colors.background.secondary}
              onChange={value =>
                setTheme({ colors: { background: { secondary: value } } })
              }
            />
            <ColorPicker
              label="Tertiaire"
              value={colors.background.tertiary}
              onChange={value =>
                setTheme({ colors: { background: { tertiary: value } } })
              }
            />
          </ColorGrid>
        </SubSection>

        {/* Text Colors */}
        <SubSection title="Couleurs de Texte">
          <ColorGrid>
            <ColorPicker
              label="Primaire"
              value={colors.text.primary}
              onChange={value =>
                setTheme({ colors: { text: { primary: value } } })
              }
            />
            <ColorPicker
              label="Secondaire"
              value={colors.text.secondary}
              onChange={value =>
                setTheme({ colors: { text: { secondary: value } } })
              }
            />
            <ColorPicker
              label="Tertiaire"
              value={colors.text.tertiary}
              onChange={value =>
                setTheme({ colors: { text: { tertiary: value } } })
              }
            />
          </ColorGrid>
        </SubSection>

        {/* Accent Colors */}
        <SubSection title="Couleurs d'Accent">
          <ColorGrid>
            <ColorPicker
              label="Bleu"
              value={colors.accent.blue.primary}
              onChange={value =>
                setTheme({ colors: { accent: { blue: { primary: value } } } })
              }
            />
            <ColorPicker
              label="Vert (Enregistrer)"
              value={colors.accent.green.button}
              onChange={value =>
                setTheme({ colors: { accent: { green: { button: value } } } })
              }
            />
            <ColorPicker
              label="Rouge (En cours)"
              value={colors.accent.red.button}
              onChange={value =>
                setTheme({ colors: { accent: { red: { button: value } } } })
              }
            />
          </ColorGrid>
        </SubSection>

        {/* Border Colors */}
        <SubSection title="Couleurs de Bordure">
          <ColorGrid>
            <ColorPicker
              label="Primaire"
              value={colors.border.primary}
              onChange={value =>
                setTheme({ colors: { border: { primary: value } } })
              }
            />
            <ColorPicker
              label="Accent"
              value={colors.border.accent}
              onChange={value =>
                setTheme({ colors: { border: { accent: value } } })
              }
            />
          </ColorGrid>
        </SubSection>
      </Section>

      {/* Spacing Section */}
      <Section
        icon={<Ruler size={20} />}
        title="Espacement"
        description="Ajustez les espacements pour modifier la densité de l'interface"
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.lg
          }}
        >
          {(['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const).map(size => (
            <div
              key={size}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.xl
              }}
            >
              <div
                style={{
                  width: '80px',
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.text.secondary
                }}
              >
                {size.toUpperCase()}
              </div>
              <div
                style={{
                  height: '24px',
                  width: spacing[size],
                  backgroundColor: colors.accent.blue.primary,
                  borderRadius: theme.borderRadius.sm,
                  transition: 'width 0.2s'
                }}
              />
              <input
                type="range"
                min="0"
                max="60"
                value={parseInt(spacing[size])}
                onChange={e => {
                  const value = `${e.target.value}px`;
                  setTheme({ spacing: { [size]: value } });
                }}
                style={{
                  flex: 1,
                  accentColor: colors.accent.blue.primary
                }}
              />
              <div
                style={{
                  width: '60px',
                  fontSize: typography.fontSize.xs,
                  color: colors.text.tertiary,
                  fontFamily: 'monospace',
                  textAlign: 'right'
                }}
              >
                {spacing[size]}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Typography Section */}
      <Section
        icon={<Type size={20} />}
        title="Typographie"
        description="Modifiez les tailles de police pour ajuster la hiérarchie du texte"
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.lg
          }}
        >
          {(['xs', 'sm', 'base', 'lg', 'xl'] as const).map(size => (
            <div
              key={size}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.xl
              }}
            >
              <div
                style={{
                  width: '80px',
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.text.secondary
                }}
              >
                {size.toUpperCase()}
              </div>
              <div
                style={{
                  flex: 1,
                  fontSize: typography.fontSize[size],
                  color: colors.text.primary,
                  transition: 'font-size 0.2s'
                }}
              >
                The quick brown fox
              </div>
              <input
                type="range"
                min="8"
                max="48"
                value={parseInt(typography.fontSize[size])}
                onChange={e => {
                  const value = `${e.target.value}px`;
                  setTheme({ typography: { fontSize: { [size]: value } } });
                }}
                style={{
                  width: '200px',
                  accentColor: colors.accent.blue.primary
                }}
              />
              <div
                style={{
                  width: '60px',
                  fontSize: typography.fontSize.xs,
                  color: colors.text.tertiary,
                  fontFamily: 'monospace',
                  textAlign: 'right'
                }}
              >
                {typography.fontSize[size]}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
};

// Helper Components - Same style as demo
const Section = ({
  icon,
  title,
  description,
  children
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) => {
  const { theme } = useTheme();
  const { colors, spacing, typography } = theme;

  return (
    <div
      style={{
        marginBottom: spacing['4xl']
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing.md,
          marginBottom: spacing.md
        }}
      >
        <div style={{ color: colors.accent.blue.primary }}>{icon}</div>
        <h2
          style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary
          }}
        >
          {title}
        </h2>
      </div>
      <p
        style={{
          fontSize: typography.fontSize.sm,
          color: colors.text.tertiary,
          marginBottom: spacing.xl,
          lineHeight: typography.lineHeight.relaxed
        }}
      >
        {description}
      </p>
      {children}
    </div>
  );
};

const SubSection = ({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const { theme } = useTheme();
  const { colors, spacing, typography } = theme;

  return (
    <div
      style={{
        marginBottom: spacing.xl
      }}
    >
      <h4
        style={{
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.semibold,
          color: colors.text.secondary,
          marginBottom: spacing.lg
        }}
      >
        {title}
      </h4>
      {children}
    </div>
  );
};

const ColorGrid = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  const { spacing } = theme;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: spacing.lg
      }}
    >
      {children}
    </div>
  );
};

export default VisualEditor;
