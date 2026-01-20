import { useState } from 'react'
import type { ThemeConfig } from '@/lib/theme-schema'
import type { PresetName } from '@/lib/theme-presets'
import { useThemeStore } from '@/hooks/useThemeStore'
import ColorPalette from './ColorPalette'

interface PresetMetadata {
  name: string
  description: string
  icon: string
}

interface ThemePreviewCardProps {
  preset: PresetName
  metadata: PresetMetadata
  theme: ThemeConfig
  isActive: boolean
  onClick: () => void
}

/**
 * ThemePreviewCard - Beautiful theme selection card
 *
 * Features:
 * - Large emoji icon
 * - Theme name and description
 * - Color palette preview
 * - Active state with border glow
 * - Smooth hover animations
 * - Scale and shadow effects
 */
export default function ThemePreviewCard({
  preset,
  metadata,
  theme: previewTheme,
  isActive,
  onClick
}: ThemePreviewCardProps) {
  const { theme } = useThemeStore()
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.background.secondary,
        border: isActive
          ? `2px solid ${theme.colors.accent.primary.primary}`
          : `1px solid ${theme.colors.border.primary}`,
        borderRadius: theme.borderRadius.lg,
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        boxShadow: isActive || isHovered ? '0 8px 16px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: theme.spacing.sm,
        minHeight: '200px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Subtle glow effect when active */}
      {isActive && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 50% 0%, ${theme.colors.accent.primary.primary}22 0%, transparent 70%)`,
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: theme.spacing.sm,
          width: '100%'
        }}
      >
        {/* Icon */}
        <div
          style={{
            fontSize: '48px',
            lineHeight: '1',
            marginBottom: theme.spacing.xs
          }}
        >
          {metadata.icon}
        </div>

        {/* Name */}
        <div
          style={{
            fontSize: theme.typography.fontSize.base,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary,
            textAlign: 'center',
            letterSpacing: '0.5px'
          }}
        >
          {metadata.name}
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.text.tertiary,
            textAlign: 'center',
            minHeight: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: theme.typography.lineHeight.normal
          }}
        >
          {metadata.description}
        </div>

        {/* Color Palette Preview */}
        <ColorPalette theme={previewTheme} size="sm" layout="grid" />

        {/* Active indicator */}
        {isActive && (
          <div
            style={{
              marginTop: theme.spacing.xs,
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.accent.primary.primary,
              fontWeight: theme.typography.fontWeight.medium,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>✓</span>
            <span>Actif</span>
          </div>
        )}
      </div>
    </div>
  )
}
