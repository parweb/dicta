import { useTheme } from '@/lib/theme-context'

interface ColorGridProps {
  children: React.ReactNode
}

export default function ColorGrid({ children }: ColorGridProps) {
  const { theme } = useTheme()
  const { spacing } = theme

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
  )
}
