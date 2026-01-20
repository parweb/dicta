import { Palette } from 'lucide-react'
import { useThemeStoreConfig } from '@/hooks/useThemeStore'
import { useThemeStore } from '@/hooks/useThemeStore'
import Section from '../layout/Section'
import SubSection from '../layout/SubSection'
import ColorGrid from '../layout/ColorGrid'
import ColorPicker from '../ColorPicker'

export default function ColorsSection() {
  const { theme } = useThemeStore()
  const { setTheme } = useThemeStoreConfig()
  const { colors } = theme

  return (
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
            onChange={(value) => setTheme({ colors: { background: { primary: value } } })}
          />
          <ColorPicker
            label="Secondaire"
            value={colors.background.secondary}
            onChange={(value) => setTheme({ colors: { background: { secondary: value } } })}
          />
          <ColorPicker
            label="Tertiaire"
            value={colors.background.tertiary}
            onChange={(value) => setTheme({ colors: { background: { tertiary: value } } })}
          />
        </ColorGrid>
      </SubSection>

      {/* Text Colors */}
      <SubSection title="Couleurs de Texte">
        <ColorGrid>
          <ColorPicker
            label="Primaire"
            value={colors.text.primary}
            onChange={(value) => setTheme({ colors: { text: { primary: value } } })}
          />
          <ColorPicker
            label="Secondaire"
            value={colors.text.secondary}
            onChange={(value) => setTheme({ colors: { text: { secondary: value } } })}
          />
          <ColorPicker
            label="Tertiaire"
            value={colors.text.tertiary}
            onChange={(value) => setTheme({ colors: { text: { tertiary: value } } })}
          />
        </ColorGrid>
      </SubSection>

      {/* Accent Colors */}
      <SubSection title="Couleurs d'Accent">
        <ColorGrid>
          <ColorPicker
            label="Bleu"
            value={colors.accent.blue.primary}
            onChange={(value) => setTheme({ colors: { accent: { blue: { primary: value } } } })}
          />
          <ColorPicker
            label="Vert (Enregistrer)"
            value={colors.accent.green.button}
            onChange={(value) => setTheme({ colors: { accent: { green: { button: value } } } })}
          />
          <ColorPicker
            label="Rouge (En cours)"
            value={colors.accent.red.button}
            onChange={(value) => setTheme({ colors: { accent: { red: { button: value } } } })}
          />
        </ColorGrid>
      </SubSection>

      {/* Border Colors */}
      <SubSection title="Couleurs de Bordure">
        <ColorGrid>
          <ColorPicker
            label="Primaire"
            value={colors.border.primary}
            onChange={(value) => setTheme({ colors: { border: { primary: value } } })}
          />
          <ColorPicker
            label="Accent"
            value={colors.border.accent}
            onChange={(value) => setTheme({ colors: { border: { accent: value } } })}
          />
        </ColorGrid>
      </SubSection>
    </Section>
  )
}
