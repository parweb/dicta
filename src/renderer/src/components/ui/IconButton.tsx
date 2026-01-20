/**
 * Icon Button Component
 * Reusable button with icon and hover states
 */

import { memo, useState, type ReactNode } from 'react'
import { useTheme } from '@/lib/theme-context'

interface IconButtonProps {
  icon: ReactNode
  onClick?: () => void
  label?: string
  color?: string
}

const IconButton = memo(function IconButton({
  icon,
  onClick,
  label,
  color
}: IconButtonProps) {
  const { theme } = useTheme()
  const { colors, spacing, typography } = theme
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: spacing.xs,
        backgroundColor: isHovered ? colors.background.secondary : 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: color || colors.text.tertiary,
        display: 'flex',
        alignItems: 'center',
        gap: spacing.xs,
        borderRadius: '2px',
        fontSize: typography.fontSize.xs,
        transition: 'background-color 0.15s'
      }}
    >
      {icon}
      {label && <span>{label}</span>}
    </button>
  )
})

export default IconButton
