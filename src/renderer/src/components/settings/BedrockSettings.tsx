import { useState, useEffect } from 'react'
import { useBedrock } from '../../contexts/BedrockContext'
import { useTheme } from '../../lib/theme-context'
import { DEFAULT_MODEL_ID } from '../../lib/bedrock/constants'
import CredentialsViewMode from './bedrock/CredentialsViewMode'
import CredentialsEditForm from './bedrock/CredentialsEditForm'
import DeleteConfirmModal from './shared/DeleteConfirmModal'

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

  const handleCancel = () => {
    setIsEditing(false)
    setBearerToken('')
    setError(null)
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
        <CredentialsViewMode
          credentials={credentials!}
          onEdit={() => setIsEditing(true)}
          onDelete={() => setShowDeleteConfirm(true)}
        />
      ) : (
        <CredentialsEditForm
          bearerToken={bearerToken}
          region={region}
          modelId={modelId}
          isSaving={isSaving}
          error={error}
          hasExisting={hasCredentials}
          onBearerTokenChange={setBearerToken}
          onRegionChange={setRegion}
          onModelIdChange={setModelId}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {/* Delete Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          title="Supprimer la configuration ?"
          message="L'agent Bedrock sera désactivé."
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  )
}
