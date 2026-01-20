import { Cloud } from 'lucide-react'
import { useThemeStore } from '@/hooks/useThemeStore'
import { Button } from '@/components/ui/button'
import type { BedrockCredentials } from '@/contexts/BedrockContext'

interface CredentialsViewModeProps {
  credentials: BedrockCredentials
  onEdit: () => void
  onDelete: () => void
}

export default function CredentialsViewMode({
  credentials,
  onEdit,
  onDelete
}: CredentialsViewModeProps) {
  const { theme } = useThemeStore()
  const { colors, spacing, typography } = theme

  return (
    <div>
      <div
        style={{
          padding: spacing.lg,
          backgroundColor: colors.background.secondary + '40',
          borderRadius: '2px',
          marginBottom: spacing.lg
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.md,
            marginBottom: spacing.md
          }}
        >
          <Cloud size={16} color={colors.text.tertiary} />
          <span
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.secondary,
              fontFamily: 'monospace'
            }}
          >
            Bearer Token: ey••••••••••••••
          </span>
        </div>
        <div
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary,
            paddingLeft: spacing['2xl']
          }}
        >
          <div>Région: {credentials.region}</div>
          <div style={{ marginTop: spacing.xs }}>Model: {credentials.modelId}</div>
        </div>
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
