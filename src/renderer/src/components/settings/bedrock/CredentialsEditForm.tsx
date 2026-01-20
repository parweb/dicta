import { useTheme } from '@/lib/theme-context'
import { Button } from '@/components/ui/button'
import { AWS_REGIONS, DEFAULT_MODEL_ID } from '@/lib/bedrock/constants'

interface CredentialsEditFormProps {
  bearerToken: string
  region: string
  modelId: string
  isSaving: boolean
  error: string | null
  hasExisting: boolean
  onBearerTokenChange: (value: string) => void
  onRegionChange: (value: string) => void
  onModelIdChange: (value: string) => void
  onSave: () => void
  onCancel: () => void
}

export default function CredentialsEditForm({
  bearerToken,
  region,
  modelId,
  isSaving,
  error,
  hasExisting,
  onBearerTokenChange,
  onRegionChange,
  onModelIdChange,
  onSave,
  onCancel
}: CredentialsEditFormProps) {
  const { theme } = useTheme()
  const { colors, spacing, typography } = theme

  return (
    <div>
      {/* Bearer Token Input */}
      <div style={{ marginBottom: spacing.lg }}>
        <label
          style={{
            display: 'block',
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary,
            marginBottom: spacing.xs
          }}
        >
          Bearer Token
        </label>
        <input
          type="password"
          value={bearerToken}
          onChange={(e) => onBearerTokenChange(e.target.value)}
          placeholder="eyJhbGciOiJSUzI1NiIs..."
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
            fontFamily: 'monospace'
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = colors.text.tertiary)}
          onBlur={(e) => (e.currentTarget.style.borderColor = colors.border.primary)}
        />
      </div>

      {/* Region Select */}
      <div style={{ marginBottom: spacing.lg }}>
        <label
          style={{
            display: 'block',
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary,
            marginBottom: spacing.xs
          }}
        >
          Région AWS
        </label>
        <select
          value={region}
          onChange={(e) => onRegionChange(e.target.value)}
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
            cursor: 'pointer'
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = colors.text.tertiary)}
          onBlur={(e) => (e.currentTarget.style.borderColor = colors.border.primary)}
        >
          {AWS_REGIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {/* Model ID Input */}
      <div style={{ marginBottom: spacing.lg }}>
        <label
          style={{
            display: 'block',
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary,
            marginBottom: spacing.xs
          }}
        >
          Model ID (Inference Profile)
        </label>
        <input
          type="text"
          value={modelId}
          onChange={(e) => onModelIdChange(e.target.value)}
          placeholder={DEFAULT_MODEL_ID}
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
            fontFamily: 'monospace'
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = colors.text.tertiary)}
          onBlur={(e) => (e.currentTarget.style.borderColor = colors.border.primary)}
        />
        <p
          style={{
            fontSize: typography.fontSize.xs,
            color: colors.text.tertiary,
            margin: 0,
            marginTop: spacing.xs
          }}
        >
          Utiliser un inference profile, pas un model ID direct
        </p>
      </div>

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
        <Button
          onClick={onSave}
          disabled={!bearerToken.trim() || isSaving}
          size="sm"
          className="flex-1"
        >
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
          href="https://console.aws.amazon.com/bedrock/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'inherit',
            textDecoration: 'none',
            borderBottom: `1px solid ${colors.border.primary}`
          }}
        >
          Console AWS Bedrock
        </a>
      </p>
    </div>
  )
}
