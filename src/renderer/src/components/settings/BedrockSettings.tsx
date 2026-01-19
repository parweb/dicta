import { useState, useEffect } from 'react'
import { Cloud } from 'lucide-react'

import { useBedrock } from '../../contexts/BedrockContext'
import { useTheme } from '../../lib/theme-context'
import { Button } from '../ui/button'

// AWS regions that support Bedrock
const AWS_REGIONS = [
  { value: 'us-east-1', label: 'US East (N. Virginia)' },
  { value: 'us-west-2', label: 'US West (Oregon)' },
  { value: 'eu-west-1', label: 'Europe (Ireland)' },
  { value: 'eu-west-3', label: 'Europe (Paris)' },
  { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
  { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' }
]

// Default model ID (inference profile)
const DEFAULT_MODEL_ID = 'us.anthropic.claude-sonnet-4-5-20250929-v1:0'

export default function BedrockSettings() {
  const { theme } = useTheme()
  const { colors, spacing, typography } = theme
  const { hasCredentials, saveCredentials, deleteCredentials, credentials } = useBedrock()

  const [isEditing, setIsEditing] = useState(!hasCredentials)
  const [bearerToken, setBearerToken] = useState('')
  const [region, setRegion] = useState('us-east-1')
  const [modelId, setModelId] = useState(DEFAULT_MODEL_ID)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Load existing credentials when entering edit mode
  useEffect(() => {
    if (isEditing && credentials) {
      setRegion(credentials.region || 'us-east-1')
      setModelId(credentials.modelId || DEFAULT_MODEL_ID)
    }
  }, [isEditing, credentials])

  const handleSave = async () => {
    if (!bearerToken.trim()) {
      setError('Bearer Token requis')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      await saveCredentials({
        bearerToken: bearerToken.trim(),
        region: region,
        modelId: modelId.trim() || DEFAULT_MODEL_ID
      })
      setBearerToken('')
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteCredentials()
      setShowDeleteConfirm(false)
      setIsEditing(true)
    } catch (err) {
      console.error('Error deleting Bedrock credentials:', err)
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: '560px' }}>
      {/* Header */}
      <div style={{ marginBottom: spacing['4xl'] }}>
        <h2
          style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.medium,
            color: colors.text.primary,
            margin: 0,
            marginBottom: spacing.xs
          }}
        >
          AWS Bedrock
        </h2>
        <p
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.tertiary,
            margin: 0
          }}
        >
          {hasCredentials && !isEditing
            ? 'Configuration AWS Bedrock stockée et chiffrée'
            : "Configuration de l'agent LLM AWS Bedrock"}
        </p>
      </div>

      {/* Content */}
      {hasCredentials && !isEditing ? (
        // View Mode
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
              <div>Région: {credentials?.region}</div>
              <div style={{ marginTop: spacing.xs }}>Model: {credentials?.modelId}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: spacing.sm }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="flex-1"
            >
              Modifier
            </Button>

            <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(true)}>
              Supprimer
            </Button>
          </div>
        </div>
      ) : (
        // Edit Mode
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
              onChange={(e) => setBearerToken(e.target.value)}
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
              onChange={(e) => setRegion(e.target.value)}
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
              onChange={(e) => setModelId(e.target.value)}
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
              onClick={handleSave}
              disabled={!bearerToken.trim() || isSaving}
              size="sm"
              className="flex-1"
            >
              {isSaving ? 'Enregistrement' : 'Enregistrer'}
            </Button>

            {hasCredentials && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false)
                  setBearerToken('')
                  setError(null)
                }}
              >
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
      )}

      {/* Delete Modal */}
      {showDeleteConfirm && (
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
          onClick={() => setShowDeleteConfirm(false)}
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
              Supprimer la configuration ?
            </h3>
            <p
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
                margin: 0,
                marginBottom: spacing.lg
              }}
            >
              L'agent Bedrock sera désactivé.
            </p>
            <div style={{ display: 'flex', gap: spacing.sm }}>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                className="flex-1"
              >
                Supprimer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1"
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
