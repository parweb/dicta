import { Square } from 'lucide-react'
import { useThemeStore } from '@/hooks/useThemeStore'
import Section from '../layout/Section'
import SubSection from '../layout/SubSection'

export default function ComponentsSection() {
  const { theme } = useThemeStore()
  const { colors, spacing, typography, borderRadius, borders, components } = theme

  return (
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
  )
}
