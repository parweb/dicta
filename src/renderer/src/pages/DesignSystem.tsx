import { Palette, Type, Ruler, Circle, Square, Sparkles } from 'lucide-react';

import { useTheme } from '../lib/theme-context';

const DesignSystem = () => {
  // Use theme from context for live preview
  const { theme } = useTheme();
  const { colors, spacing, typography, borderRadius, borders, shadows, charts, components } =
    theme;

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
          title="Palette de Couleurs"
          description="Couleurs de fond, texte, bordures et accents"
        >
          {/* Background Colors */}
          <SubSection title="Couleurs de Fond">
            <ColorGrid>
              <ColorCard name="Primary" hex={colors.background.primary} />
              <ColorCard name="Secondary" hex={colors.background.secondary} />
              <ColorCard name="Tertiary" hex={colors.background.tertiary} />
              <ColorCard name="Overlay" hex={colors.background.overlay} />
            </ColorGrid>
          </SubSection>

          {/* Text Colors */}
          <SubSection title="Couleurs de Texte">
            <ColorGrid>
              <ColorCard name="Primary" hex={colors.text.primary} />
              <ColorCard name="Secondary" hex={colors.text.secondary} />
              <ColorCard name="Tertiary" hex={colors.text.tertiary} />
              <ColorCard name="Disabled" hex={colors.text.disabled} />
            </ColorGrid>
          </SubSection>

          {/* Border Colors */}
          <SubSection title="Couleurs de Bordure">
            <ColorGrid>
              <ColorCard name="Primary" hex={colors.border.primary} />
              <ColorCard name="Secondary" hex={colors.border.secondary} />
              <ColorCard name="Accent" hex={colors.border.accent} />
            </ColorGrid>
          </SubSection>

          {/* Accent Colors */}
          <SubSection title="Couleurs d'Accent">
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xl }}>
              <div>
                <h5
                  style={{
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.secondary,
                    marginBottom: spacing.sm
                  }}
                >
                  Bleu
                </h5>
                <ColorGrid>
                  <ColorCard name="Primary" hex={colors.accent.blue.primary} />
                  <ColorCard name="Light" hex={colors.accent.blue.light} />
                  <ColorCard name="Dark" hex={colors.accent.blue.dark} />
                </ColorGrid>
              </div>
              <div>
                <h5
                  style={{
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.secondary,
                    marginBottom: spacing.sm
                  }}
                >
                  Autres accents
                </h5>
                <ColorGrid>
                  <ColorCard name="Green Primary" hex={colors.accent.green.primary} />
                  <ColorCard name="Green Button" hex={colors.accent.green.button} />
                  <ColorCard name="Red Primary" hex={colors.accent.red.primary} />
                  <ColorCard name="Red Button" hex={colors.accent.red.button} />
                  <ColorCard name="Yellow Primary" hex={colors.accent.yellow.primary} />
                  <ColorCard name="Yellow Light" hex={colors.accent.yellow.light} />
                </ColorGrid>
              </div>
            </div>
          </SubSection>

          {/* State Colors */}
          <SubSection title="Couleurs d'État">
            <ColorGrid>
              <ColorCard name="Success" hex={colors.state.success} />
              <ColorCard name="Error" hex={colors.state.error} />
              <ColorCard name="Loading" hex={colors.state.loading} />
              <ColorCard name="Cancelled" hex={colors.state.cancelled} />
              <ColorCard name="Idle" hex={colors.state.idle} />
            </ColorGrid>
          </SubSection>
        </Section>

        {/* Spacing Section */}
        <Section
          icon={<Ruler size={20} />}
          title="Espacement"
          description="Échelle d'espacement pour une hiérarchie cohérente"
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing.md
            }}
          >
            {Object.entries(spacing).map(([key, value]) => (
              <div
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.lg
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
                  {key}
                </div>
                <div
                  style={{
                    height: '24px',
                    width: value,
                    backgroundColor: colors.accent.blue.primary,
                    borderRadius: borderRadius.sm
                  }}
                />
                <div
                  style={{
                    fontSize: typography.fontSize.xs,
                    color: colors.text.tertiary,
                    fontFamily: 'monospace'
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Typography Section */}
        <Section
          icon={<Type size={20} />}
          title="Typographie"
          description="Tailles de police, graisses et espacements"
        >
          {/* Font Sizes */}
          <SubSection title="Tailles de Police">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: spacing.lg
              }}
            >
              {Object.entries(typography.fontSize).map(([key, value]) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
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
                    {key}
                  </div>
                  <div
                    style={{
                      fontSize: value,
                      color: colors.text.primary
                    }}
                  >
                    The quick brown fox jumps over the lazy dog
                  </div>
                  <div
                    style={{
                      fontSize: typography.fontSize.xs,
                      color: colors.text.tertiary,
                      fontFamily: 'monospace',
                      marginLeft: 'auto'
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </SubSection>

          {/* Font Weights */}
          <SubSection title="Graisses de Police">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: spacing.lg
              }}
            >
              {Object.entries(typography.fontWeight).map(([key, value]) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.xl
                  }}
                >
                  <div
                    style={{
                      width: '100px',
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.text.secondary
                    }}
                  >
                    {key}
                  </div>
                  <div
                    style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: value,
                      color: colors.text.primary
                    }}
                  >
                    The quick brown fox
                  </div>
                  <div
                    style={{
                      fontSize: typography.fontSize.xs,
                      color: colors.text.tertiary,
                      fontFamily: 'monospace',
                      marginLeft: 'auto'
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </SubSection>
        </Section>

        {/* Border Radius Section */}
        <Section
          icon={<Circle size={20} />}
          title="Border Radius"
          description="Arrondis pour les éléments de l'interface"
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: spacing.xl
            }}
          >
            {Object.entries(borderRadius).map(([key, value]) => (
              <div
                key={key}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: spacing.md
                }}
              >
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: colors.accent.blue.primary,
                    borderRadius: value === '50%' ? value : value
                  }}
                />
                <div
                  style={{
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.text.secondary
                  }}
                >
                  {key}
                </div>
                <div
                  style={{
                    fontSize: typography.fontSize.xs,
                    color: colors.text.tertiary,
                    fontFamily: 'monospace'
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Shadows Section */}
        <Section
          icon={<Sparkles size={20} />}
          title="Ombres"
          description="Élévations pour créer de la profondeur"
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: spacing.xl
            }}
          >
            {Object.entries(shadows).map(([key, value]) => (
              <div
                key={key}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: spacing.md
                }}
              >
                <div
                  style={{
                    width: '100px',
                    height: '100px',
                    backgroundColor: colors.background.secondary,
                    borderRadius: borderRadius.md,
                    boxShadow: value
                  }}
                />
                <div
                  style={{
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.text.secondary
                  }}
                >
                  {key}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Components Section */}
        <Section
          icon={<Square size={20} />}
          title="Composants"
          description="Styles prédéfinis pour les composants de l'interface"
        >
          {/* Buttons */}
          <SubSection title="Boutons">
            <div
              style={{
                display: 'flex',
                gap: spacing.lg,
                flexWrap: 'wrap'
              }}
            >
              <button
                style={{
                  ...components.button.base,
                  padding: `${spacing.md} ${spacing.xl}`,
                  backgroundColor: colors.accent.blue.primary,
                  color: colors.text.primary,
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium
                }}
              >
                Button Primary
              </button>
              <button
                style={{
                  ...components.button.base,
                  padding: `${spacing.md} ${spacing.xl}`,
                  backgroundColor: colors.accent.green.button,
                  color: colors.text.primary,
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium
                }}
              >
                Button Success
              </button>
              <button
                style={{
                  ...components.button.base,
                  padding: `${spacing.md} ${spacing.xl}`,
                  backgroundColor: colors.accent.red.button,
                  color: colors.text.primary,
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium
                }}
              >
                Button Danger
              </button>
            </div>
          </SubSection>

          {/* Cards */}
          <SubSection title="Cartes">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: spacing.lg
              }}
            >
              <div style={components.card.base}>
                <h4
                  style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                    marginBottom: spacing.sm
                  }}
                >
                  Card Title
                </h4>
                <p
                  style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.text.tertiary,
                    lineHeight: typography.lineHeight.relaxed
                  }}
                >
                  Carte avec les styles de base du design system. Utilisée pour grouper du contenu.
                </p>
              </div>
              <div
                style={{
                  ...components.card.base,
                  ...components.card.hover
                }}
              >
                <h4
                  style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                    marginBottom: spacing.sm
                  }}
                >
                  Card Hover State
                </h4>
                <p
                  style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.text.tertiary,
                    lineHeight: typography.lineHeight.relaxed
                  }}
                >
                  État hover avec un fond plus sombre et une bordure plus claire.
                </p>
              </div>
            </div>
          </SubSection>

          {/* Input */}
          <SubSection title="Inputs">
            <input
              type="text"
              placeholder="Exemple d'input"
              style={{
                ...components.input.base,
                width: '100%',
                maxWidth: '400px',
                border: borders.primary,
                fontSize: typography.fontSize.base,
                outline: 'none'
              }}
            />
          </SubSection>

          {/* Proxy Indicators */}
          <SubSection title="Indicateurs de Proxy">
            <div
              style={{
                display: 'flex',
                gap: spacing.md,
                flexWrap: 'wrap'
              }}
            >
              {(['idle', 'loading', 'success', 'error', 'cancelled'] as const).map((status) => (
                <div
                  key={status}
                  style={{
                    ...components.proxyIndicator.container,
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.sm
                  }}
                >
                  <div
                    style={{
                      ...components.proxyIndicator.dot,
                      backgroundColor: colors.state[status]
                    }}
                  />
                  <span
                    style={{
                      fontSize: typography.fontSize.xs,
                      fontWeight: typography.fontWeight.medium,
                      textTransform: 'capitalize'
                    }}
                  >
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </SubSection>
        </Section>

        {/* Charts Section */}
        <Section
          icon={<BarChart3Icon size={20} />}
          title="Graphiques"
          description="Couleurs pour les visualisations de données"
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing.lg
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.xl
              }}
            >
              <div
                style={{
                  width: '120px',
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.text.secondary
                }}
              >
                Bar Fill
              </div>
              <div
                style={{
                  width: '80px',
                  height: '40px',
                  backgroundColor: charts.bar.fill,
                  borderRadius: borderRadius.sm
                }}
              />
              <div
                style={{
                  fontSize: typography.fontSize.xs,
                  color: colors.text.tertiary,
                  fontFamily: 'monospace'
                }}
              >
                {charts.bar.fill}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.xl
              }}
            >
              <div
                style={{
                  width: '120px',
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.text.secondary
                }}
              >
                Brush Stroke
              </div>
              <div
                style={{
                  width: '80px',
                  height: '40px',
                  backgroundColor: charts.brush.stroke,
                  borderRadius: borderRadius.sm
                }}
              />
              <div
                style={{
                  fontSize: typography.fontSize.xs,
                  color: colors.text.tertiary,
                  fontFamily: 'monospace'
                }}
              >
                {charts.brush.stroke}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.xl
              }}
            >
              <div
                style={{
                  width: '120px',
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.text.secondary
                }}
              >
                Brush Fill
              </div>
              <div
                style={{
                  width: '80px',
                  height: '40px',
                  backgroundColor: charts.brush.fill,
                  border: `2px solid ${colors.border.primary}`,
                  borderRadius: borderRadius.sm
                }}
              />
              <div
                style={{
                  fontSize: typography.fontSize.xs,
                  color: colors.text.tertiary,
                  fontFamily: 'monospace'
                }}
              >
                {charts.brush.fill}
              </div>
            </div>
          </div>
        </Section>
    </div>
  );
};

// Helper Components
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

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: spacing.lg
      }}
    >
      {children}
    </div>
  );
};

const ColorCard = ({ name, hex }: { name: string; hex: string }) => {
  const { theme } = useTheme();
  const { colors, spacing, typography, borderRadius, borders } = theme;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.sm
      }}
    >
      <div
        style={{
          height: '80px',
          backgroundColor: hex,
          borderRadius: borderRadius.md,
          border: borders.light
        }}
      />
      <div
        style={{
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          color: colors.text.secondary
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontSize: typography.fontSize.xs,
          color: colors.text.tertiary,
          fontFamily: 'monospace'
        }}
      >
        {hex}
      </div>
    </div>
  );
};

// Missing icon import
const BarChart3Icon = ({ size }: { size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 3v18h18" />
    <path d="M18 17V9" />
    <path d="M13 17V5" />
    <path d="M8 17v-3" />
  </svg>
);

export default DesignSystem;
