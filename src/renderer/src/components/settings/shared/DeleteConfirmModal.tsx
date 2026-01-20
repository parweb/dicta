import { useTheme } from '@/lib/theme-context'
import { Button } from '@/components/ui/button'

interface DeleteConfirmModalProps {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteConfirmModal({
  title,
  message,
  onConfirm,
  onCancel
}: DeleteConfirmModalProps) {
  const { theme } = useTheme()
  const { colors, spacing, typography } = theme

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(8px)'
      }}
      onClick={onCancel}
    >
      <div
        style={{
          backgroundColor: colors.background.primary,
          border: `1px solid ${colors.border.primary}`,
          borderRadius: '2px',
          padding: spacing.xl,
          maxWidth: '320px',
          margin: spacing.md
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.medium,
            color: colors.text.primary,
            marginTop: 0,
            marginBottom: spacing.md
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary,
            margin: 0,
            marginBottom: spacing.lg
          }}
        >
          {message}
        </p>
        <div style={{ display: 'flex', gap: spacing.sm }}>
          <Button variant="destructive" size="sm" onClick={onConfirm} className="flex-1">
            Supprimer
          </Button>
          <Button variant="outline" size="sm" onClick={onCancel} className="flex-1">
            Annuler
          </Button>
        </div>
      </div>
    </div>
  )
}
