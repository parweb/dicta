/**
 * Conversation Timeline Component
 * Non-linear vertical timeline with navigation points
 */

import { useTheme } from '@/lib/theme-context'

interface ConversationTimelineProps {
  itemCount: number
  currentIndex: number
  onNavigate?: (index: number) => void
}

export default function ConversationTimeline({
  itemCount,
  currentIndex,
  onNavigate
}: ConversationTimelineProps) {
  const { theme } = useTheme()
  const { colors, spacing } = theme

  if (itemCount === 0) return null

  return (
    <div
      style={{
        position: 'absolute',
        left: spacing.lg,
        top: spacing.lg,
        bottom: spacing.lg,
        width: '40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
        pointerEvents: 'none'
      }}
    >
      {/* Vertical line */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '20px',
          bottom: '20px',
          width: '2px',
          backgroundColor: colors.border.primary,
          transform: 'translateX(-50%)'
        }}
      />

      {/* Navigation points */}
      {Array.from({ length: itemCount }).map((_, index) => {
        const isCurrent = index === currentIndex
        const position = itemCount === 1 ? 50 : (index / (itemCount - 1)) * 100

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: `${position}%`,
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'auto',
              cursor: 'pointer',
              zIndex: 20
            }}
            onClick={() => onNavigate?.(index)}
          >
            {/* Point */}
            <div
              style={{
                width: isCurrent ? '16px' : '12px',
                height: isCurrent ? '16px' : '12px',
                borderRadius: '50%',
                backgroundColor: isCurrent ? colors.background.primary : colors.text.primary,
                border: isCurrent ? `2px solid ${colors.state.error}` : 'none',
                transition: 'all 0.2s ease',
                boxShadow: isCurrent ? '0 0 0 4px rgba(239, 68, 68, 0.2)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isCurrent) {
                  e.currentTarget.style.transform = 'scale(1.2)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isCurrent) {
                  e.currentTarget.style.transform = 'scale(1)'
                }
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
