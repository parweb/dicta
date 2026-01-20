import { useThemeStore } from '@/hooks/useThemeStore'
import ColorsSection from './visual-editor/ColorsSection'
import SpacingSection from './visual-editor/SpacingSection'
import TypographySection from './visual-editor/TypographySection'

const VisualEditor = () => {
  const { theme } = useThemeStore()
  const { spacing } = theme

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing['4xl']
      }}
    >
      <ColorsSection />
      <SpacingSection />
      <TypographySection />
    </div>
  )
}

export default VisualEditor
