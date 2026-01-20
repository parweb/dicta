import { useThemeStore } from '@/hooks/useThemeStore'
import { Button } from '@/components/ui/button'

interface ApiKeyEditFormProps {
  value: string
  error: string | null
  isSaving: boolean
  hasExisting: boolean
  onChange: (value: string) => void
  onSave: () => void
  onCancel: () => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export default function ApiKeyEditForm({
  value,
  error,
  isSaving,
  hasExisting,
  onChange,
  onSave,
  onCancel,
  onKeyDown
}: ApiKeyEditFormProps) {
  const { theme } = useThemeStore()
  const { colors, spacing, typography } = theme

  return (
    <div>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="sk-..."
        autoFocus
        style={{
          width: '100%',
          padding: spacing.md,
          backgroundColor: colors.background.secondary + '40',
          border: `1px solid ${colors.border.primary}`,
          borderRadius: '2px',
          color: colors.text.primary,
          fontSize: typography.fontSize.sm,
          outline: 'none',
          transition: 'border-color 0.1s',
          boxSizing: 'border-box',
          fontFamily: 'monospace',
          marginBottom: spacing.sm
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = colors.text.tertiary)}
        onBlur={(e) => (e.currentTarget.style.borderColor = colors.border.primary)}
      />

      {error && (
        <div
          style={{
            fontSize: typography.fontSize.xs,
            color: colors.state.error,
            marginBottom: spacing.sm
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: spacing.sm }}>
        <Button onClick={onSave} disabled={!value.trim() || isSaving} size="sm" className="flex-1">
          {isSaving ? 'Enregistrement' : 'Enregistrer'}
        </Button>

        {hasExisting && (
          <Button variant="outline" size="sm" onClick={onCancel}>
            Annuler
          </Button>
        )}
      </div>

      <p
        style={{
          fontSize: typography.fontSize.xs,
          color: colors.text.tertiary,
          margin: 0,
          marginTop: spacing.md
        }}
      >
        <a
          href="https://platform.openai.com/api-keys"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'inherit',
            textDecoration: 'none',
            borderBottom: `1px solid ${colors.border.primary}`
          }}
        >
          Obtenir une clé
        </a>
      </p>
    </div>
  )
}
