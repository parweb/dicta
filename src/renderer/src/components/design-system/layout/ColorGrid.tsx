import { useThemeStore } from '@/hooks/useThemeStore'

interface ColorGridProps {
  children: React.ReactNode
}

export default function ColorGrid({ children }: ColorGridProps) {
  const { theme } = useThemeStore()
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
