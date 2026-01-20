import { Key } from 'lucide-react'
import { useThemeStore } from '@/hooks/useThemeStore'
import { Button } from '@/components/ui/button'

interface ApiKeyViewModeProps {
  onEdit: () => void
  onDelete: () => void
}

export default function ApiKeyViewMode({ onEdit, onDelete }: ApiKeyViewModeProps) {
  const { theme } = useThemeStore()
  const { colors, spacing, typography } = theme

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing.md,
          padding: spacing.lg,
          backgroundColor: colors.background.secondary + '40',
          borderRadius: '2px',
          marginBottom: spacing.lg
        }}
      >
        <Key size={16} color={colors.text.tertiary} />
        <span
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary,
            fontFamily: 'monospace',
            flex: 1
          }}
        >
          sk-••••••••••••••
        </span>
      </div>

      <div style={{ display: 'flex', gap: spacing.sm }}>
        <Button variant="outline" size="sm" onClick={onEdit} className="flex-1">
          Modifier
        </Button>

        <Button variant="outline" size="sm" onClick={onDelete}>
          Supprimer
        </Button>
      </div>
    </div>
  )
}
