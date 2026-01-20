import { Palette } from 'lucide-react'
import { useThemeStore } from '@/hooks/useThemeStore'
import Section from '../layout/Section'
import SubSection from '../layout/SubSection'
import ColorGrid from '../layout/ColorGrid'
import ColorCard from '../layout/ColorCard'

export default function ColorPaletteSection() {
  const { theme } = useThemeStore()
  const { colors, spacing, typography } = theme

  return (
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
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.xl
          }}
        >
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
              <ColorCard name="Primary" hex={colors.accent.primary.primary} />
              <ColorCard name="Light" hex={colors.accent.primary.light} />
              <ColorCard name="Dark" hex={colors.accent.primary.dark} />
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
              <ColorCard name="Green Primary" hex={colors.accent.success.primary} />
              <ColorCard name="Green Button" hex={colors.accent.success.button} />
              <ColorCard name="Red Primary" hex={colors.accent.error.primary} />
              <ColorCard name="Red Button" hex={colors.accent.error.button} />
              <ColorCard name="Yellow Primary" hex={colors.accent.warning.primary} />
              <ColorCard name="Yellow Light" hex={colors.accent.warning.light} />
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
  )
}
