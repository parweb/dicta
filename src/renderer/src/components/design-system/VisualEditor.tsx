import { useTheme } from '../../lib/theme-context';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '../ui/accordion';
import ColorPicker from './ColorPicker';

export default function VisualEditor() {
  const { theme, setTheme } = useTheme();

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
        Éditeur Visuel
      </h3>

      <p
        style={{
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.text.tertiary,
          margin: 0
        }}
      >
        Personnalisez les couleurs et espacements de votre thème.
      </p>

      <Accordion type="multiple" className="w-full">
        {/* Background Colors */}
        <AccordionItem value="background">
          <AccordionTrigger>Couleurs de Fond</AccordionTrigger>
          <AccordionContent>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing.lg,
                padding: theme.spacing.md
              }}
            >
              <ColorPicker
                label="Primaire"
                description="Couleur de fond principale de l'application"
                value={theme.colors.background.primary}
                onChange={(value) =>
                  setTheme({ colors: { background: { primary: value } } })
                }
              />
              <ColorPicker
                label="Secondaire"
                description="Cartes et surfaces"
                value={theme.colors.background.secondary}
                onChange={(value) =>
                  setTheme({ colors: { background: { secondary: value } } })
                }
              />
              <ColorPicker
                label="Tertiaire"
                description="Surfaces élevées"
                value={theme.colors.background.tertiary}
                onChange={(value) =>
                  setTheme({ colors: { background: { tertiary: value } } })
                }
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Text Colors */}
        <AccordionItem value="text">
          <AccordionTrigger>Couleurs de Texte</AccordionTrigger>
          <AccordionContent>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing.lg,
                padding: theme.spacing.md
              }}
            >
              <ColorPicker
                label="Primaire"
                description="Texte principal"
                value={theme.colors.text.primary}
                onChange={(value) =>
                  setTheme({ colors: { text: { primary: value } } })
                }
              />
              <ColorPicker
                label="Secondaire"
                description="Texte secondaire"
                value={theme.colors.text.secondary}
                onChange={(value) =>
                  setTheme({ colors: { text: { secondary: value } } })
                }
              />
              <ColorPicker
                label="Tertiaire"
                description="Texte atténué"
                value={theme.colors.text.tertiary}
                onChange={(value) =>
                  setTheme({ colors: { text: { tertiary: value } } })
                }
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Accent Colors */}
        <AccordionItem value="accent">
          <AccordionTrigger>Couleurs d'Accent</AccordionTrigger>
          <AccordionContent>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing.lg,
                padding: theme.spacing.md
              }}
            >
              <ColorPicker
                label="Bleu Primaire"
                description="Couleur principale d'accent"
                value={theme.colors.accent.blue.primary}
                onChange={(value) =>
                  setTheme({ colors: { accent: { blue: { primary: value } } } })
                }
              />
              <ColorPicker
                label="Vert (Bouton Enregistrer)"
                description="Bouton d'enregistrement"
                value={theme.colors.accent.green.button}
                onChange={(value) =>
                  setTheme({ colors: { accent: { green: { button: value } } } })
                }
              />
              <ColorPicker
                label="Rouge (Bouton En cours)"
                description="Bouton en cours d'enregistrement"
                value={theme.colors.accent.red.button}
                onChange={(value) =>
                  setTheme({ colors: { accent: { red: { button: value } } } })
                }
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Border Colors */}
        <AccordionItem value="border">
          <AccordionTrigger>Couleurs de Bordure</AccordionTrigger>
          <AccordionContent>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing.lg,
                padding: theme.spacing.md
              }}
            >
              <ColorPicker
                label="Primaire"
                description="Bordures principales"
                value={theme.colors.border.primary}
                onChange={(value) =>
                  setTheme({ colors: { border: { primary: value } } })
                }
              />
              <ColorPicker
                label="Accent"
                description="Bordures mises en évidence"
                value={theme.colors.border.accent}
                onChange={(value) =>
                  setTheme({ colors: { border: { accent: value } } })
                }
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Spacing */}
        <AccordionItem value="spacing">
          <AccordionTrigger>Espacement</AccordionTrigger>
          <AccordionContent>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing.lg,
                padding: theme.spacing.md
              }}
            >
              {(['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const).map((size) => (
                <div key={size} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
                  <label
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.medium,
                      color: theme.colors.text.secondary
                    }}
                  >
                    {size.toUpperCase()} - {theme.spacing[size]}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    value={parseInt(theme.spacing[size])}
                    onChange={(e) => {
                      const value = `${e.target.value}px`;
                      setTheme({ spacing: { [size]: value } });
                    }}
                    style={{
                      width: '100%',
                      accentColor: theme.colors.accent.blue.primary
                    }}
                  />
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Typography */}
        <AccordionItem value="typography">
          <AccordionTrigger>Typographie</AccordionTrigger>
          <AccordionContent>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing.lg,
                padding: theme.spacing.md
              }}
            >
              {(['xs', 'sm', 'base', 'lg', 'xl'] as const).map((size) => (
                <div key={size} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
                  <label
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.medium,
                      color: theme.colors.text.secondary
                    }}
                  >
                    {size.toUpperCase()} - {theme.typography.fontSize[size]}
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="48"
                    value={parseInt(theme.typography.fontSize[size])}
                    onChange={(e) => {
                      const value = `${e.target.value}px`;
                      setTheme({ typography: { fontSize: { [size]: value } } });
                    }}
                    style={{
                      width: '100%',
                      accentColor: theme.colors.accent.blue.primary
                    }}
                  />
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
