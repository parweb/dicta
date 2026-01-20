import { useTheme } from '@/lib/theme-context'
import ColorPaletteSection from '@/components/design-system/sections/ColorPaletteSection'
import SpacingSection from '@/components/design-system/sections/SpacingSection'
import TypographySection from '@/components/design-system/sections/TypographySection'
import BorderRadiusSection from '@/components/design-system/sections/BorderRadiusSection'
import ShadowsSection from '@/components/design-system/sections/ShadowsSection'
import ComponentsSection from '@/components/design-system/sections/ComponentsSection'
import ChartsSection from '@/components/design-system/sections/ChartsSection'

const DesignSystem = () => {
  const { theme } = useTheme()
  const { spacing } = theme

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing['4xl']
      }}
    >
      <ColorPaletteSection />
      <SpacingSection />
      <TypographySection />
      <BorderRadiusSection />
      <ShadowsSection />
      <ComponentsSection />
      <ChartsSection />
    </div>
  )
}

export default DesignSystem
