import { useState, useEffect } from 'react'
import { useApiKeyStore } from '../../hooks/useApiKeyStore'
import { useTheme } from '../../lib/theme-context'
import ApiKeyViewMode from './model/ApiKeyViewMode'
import ApiKeyEditForm from './model/ApiKeyEditForm'
import DeleteConfirmModal from './shared/DeleteConfirmModal'

export default function ModelSettings() {
  const { theme } = useTheme()
  const { colors, spacing, typography } = theme
  const { hasApiKey, saveApiKey, deleteApiKey } = useApiKeyStore()

  const [isEditing, setIsEditing] = useState(!hasApiKey)
  const [inputValue, setInputValue] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (hasApiKey && isSaving) {
      setTimeout(() => {
        setIsEditing(false)
        setIsSaving(false)
      }, 300)
    }
  }, [hasApiKey, isSaving])

  const handleSave = async () => {
    if (!inputValue.trim()) {
      setError('Clé requise')
      return
    }

    setIsSaving(true)
    setError(null)

    const result = await saveApiKey(inputValue.trim())

    if (!result.success) {
      setError(result.error || 'Erreur')
      setIsSaving(false)
    } else {
      setInputValue('')
    }
  }

  const handleDelete = async () => {
    const result = await deleteApiKey()
    if (result.success) {
      setShowDeleteConfirm(false)
      setIsEditing(true)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setInputValue('')
    setError(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      handleSave()
    } else if (e.key === 'Escape' && hasApiKey) {
      handleCancel()
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: '480px' }}>
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
          Clé API
        </h2>
        <p
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.tertiary,
            margin: 0
          }}
        >
          {hasApiKey && !isEditing ? 'Stockée et chiffrée' : 'Requise pour la transcription'}
        </p>
      </div>

      {hasApiKey && !isEditing ? (
        <ApiKeyViewMode onEdit={() => setIsEditing(true)} onDelete={() => setShowDeleteConfirm(true)} />
      ) : (
        <ApiKeyEditForm
          value={inputValue}
          error={error}
          isSaving={isSaving}
          hasExisting={hasApiKey}
          onChange={setInputValue}
          onSave={handleSave}
          onCancel={handleCancel}
          onKeyDown={handleKeyDown}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmModal
          title="Supprimer la clé ?"
          message="La transcription sera désactivée."
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  )
}
