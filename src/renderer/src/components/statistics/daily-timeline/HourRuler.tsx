import { useThemeStore } from '@/hooks/useThemeStore'

export default function HourRuler() {
  const { theme } = useThemeStore()
  const { colors, spacing } = theme

  return (
    <div
      style={{
        height: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: spacing.xs,
        animation: 'rulerIn 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
        pointerEvents: 'none'
      }}
    >
      {Array.from({ length: 24 }).map((_, hour) => {
        const isMajorTick = hour % 4 === 0 || hour === 23
        return (
          <div
            key={hour}
            style={{
              width: '1px',
              height: isMajorTick ? '8px' : '4px',
              backgroundColor: colors.text.tertiary,
              opacity: isMajorTick ? 0.6 : 0.4,
              transition: 'all 0.2s ease-out'
            }}
          />
        )
      })}
    </div>
  )
}
