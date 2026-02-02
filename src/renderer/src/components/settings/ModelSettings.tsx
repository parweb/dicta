import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useApiKeyStore } from '../../hooks/useApiKeyStore'
import { useThemeStore } from '@/hooks/useThemeStore'
import { useTranscriptionSettings } from '@/hooks/useTranscriptionSettings'
import { OFFLINE_MODEL_OPTIONS, type OfflineModelId } from '@/lib/transcription-models'
import ApiKeyViewMode from './model/ApiKeyViewMode'
import ApiKeyEditForm from './model/ApiKeyEditForm'
import DeleteConfirmModal from './shared/DeleteConfirmModal'

type DownloadPhase = 'idle' | 'starting' | 'downloading' | 'extracting' | 'completed' | 'error'

interface OfflineDownloadProgress {
  modelId: OfflineModelId
  status: DownloadPhase
  percent?: number
  message?: string
}

export default function ModelSettings() {
  const { theme } = useThemeStore()
  const { colors, spacing, typography } = theme
  const { hasApiKey, saveApiKey, deleteApiKey } = useApiKeyStore()
  const {
    transcriptionMode,
    setTranscriptionMode,
    offlineModelId,
    setOfflineModelId
  } = useTranscriptionSettings()

  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [installedOfflineModels, setInstalledOfflineModels] = useState<string[]>([])
  const [modelsDir, setModelsDir] = useState('')
  const [isModelsLoading, setIsModelsLoading] = useState(true)
  const [modelsError, setModelsError] = useState<string | null>(null)
  const [downloadState, setDownloadState] = useState<{
    modelId: OfflineModelId | null
    status: DownloadPhase
    percent?: number
    message?: string
  }>({
    modelId: null,
    status: 'idle'
  })

  const isOpenAIMode = transcriptionMode === 'openai'
  const showApiKeyEditor = isEditing || (isOpenAIMode && !hasApiKey)
  const selectedModelInstalled = installedOfflineModels.includes(offlineModelId)
  const isDownloadInProgress =
    downloadState.status === 'starting' ||
    downloadState.status === 'downloading' ||
    downloadState.status === 'extracting'

  const selectedOfflineModel = useMemo(
    () => OFFLINE_MODEL_OPTIONS.find((model) => model.id === offlineModelId),
    [offlineModelId]
  )

  useEffect(() => {
    if (hasApiKey && isSaving) {
      setTimeout(() => {
        setIsEditing(false)
        setIsSaving(false)
      }, 300)
    }
  }, [hasApiKey, isSaving])

  const loadOfflineModelStatus = async () => {
    setIsModelsLoading(true)
    setModelsError(null)

    try {
      const result = await window.api?.offlineModels.getStatus()
      if (result?.success) {
        setInstalledOfflineModels(result.installedModels || [])
        setModelsDir(result.modelsDir || '')
      } else {
        setModelsError(result?.error || 'Impossible de charger les modèles offline')
      }
    } catch (loadError) {
      setModelsError(loadError instanceof Error ? loadError.message : 'Erreur inconnue')
    } finally {
      setIsModelsLoading(false)
    }
  }

  useEffect(() => {
    loadOfflineModelStatus()
  }, [])

  useEffect(() => {
    const handleDownloadProgress = (_event: unknown, data: unknown) => {
      const progress = data as Partial<OfflineDownloadProgress>
      if (!progress || typeof progress !== 'object' || !progress.modelId || !progress.status) {
        return
      }

      setDownloadState({
        modelId: progress.modelId,
        status: progress.status,
        percent: progress.percent,
        message: progress.message
      })
    }

    const onDownloadProgress = window.api?.offlineModels.onDownloadProgress
    const removeDownloadProgressListener =
      window.api?.offlineModels.removeDownloadProgressListener

    if (
      typeof onDownloadProgress !== 'function' ||
      typeof removeDownloadProgressListener !== 'function'
    ) {
      console.warn('[OFFLINE-MODELS] Download progress bridge not available yet')
      return
    }

    onDownloadProgress(handleDownloadProgress)
    return () => {
      removeDownloadProgressListener(handleDownloadProgress)
    }
  }, [])

  const handleSelectOfflineModel = async (modelId: OfflineModelId) => {
    setOfflineModelId(modelId)
    setModelsError(null)

    if (installedOfflineModels.includes(modelId) || isDownloadInProgress) {
      return
    }

    const downloadModel = window.api?.offlineModels.download
    if (typeof downloadModel !== 'function') {
      setModelsError(
        'Le bridge de téléchargement offline n’est pas chargé. Redémarre complètement l’app.'
      )
      return
    }

    const result = await downloadModel(modelId)

    if (result?.success) {
      if (result.installedModels) {
        setInstalledOfflineModels(result.installedModels)
      }
      await loadOfflineModelStatus()
      return
    }

    setDownloadState({
      modelId,
      status: 'error'
    })
    setModelsError(result?.error || 'Le téléchargement du modèle a échoué.')
  }

  const getModelStatusLabel = (modelId: OfflineModelId, isInstalled: boolean): string => {
    if (isInstalled) {
      return 'Installé'
    }

    if (downloadState.modelId !== modelId) {
      return 'Cliquer pour télécharger'
    }

    if (downloadState.status === 'starting') {
      return 'Préparation...'
    }
    if (downloadState.status === 'downloading') {
      return downloadState.percent !== undefined
        ? `Téléchargement ${downloadState.percent}%`
        : 'Téléchargement...'
    }
    if (downloadState.status === 'extracting') {
      return 'Extraction...'
    }
    if (downloadState.status === 'error') {
      return 'Échec du téléchargement'
    }

    return 'Non détecté'
  }

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
      setIsEditing(false)
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
    <div style={{ width: '100%', maxWidth: '720px' }}>
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
          Mode de transcription
        </h2>
        <p
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.tertiary,
            margin: 0
          }}
        >
          Choisissez entre OpenAI (cloud) et des modèles locaux.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: spacing.md,
          marginBottom: spacing['3xl']
        }}
      >
        <button
          type="button"
          onClick={() => setTranscriptionMode('openai')}
          style={{
            textAlign: 'left',
            borderRadius: '4px',
            border: `1px solid ${isOpenAIMode ? colors.text.primary : colors.border.primary}`,
            backgroundColor: isOpenAIMode ? colors.background.secondary + '60' : 'transparent',
            padding: spacing.md,
            cursor: 'pointer'
          }}
        >
          <div
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.primary,
              marginBottom: spacing.xs
            }}
          >
            OpenAI
          </div>
          <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary }}>
            Qualité cloud, nécessite une clé API.
          </div>
        </button>

        <button
          type="button"
          onClick={() => setTranscriptionMode('offline')}
          style={{
            textAlign: 'left',
            borderRadius: '4px',
            border: `1px solid ${!isOpenAIMode ? colors.text.primary : colors.border.primary}`,
            backgroundColor: !isOpenAIMode ? colors.background.secondary + '60' : 'transparent',
            padding: spacing.md,
            cursor: 'pointer'
          }}
        >
          <div
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.primary,
              marginBottom: spacing.xs
            }}
          >
            Offline (local)
          </div>
          <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary }}>
            Fonctionne sans réseau une fois les modèles présents.
          </div>
        </button>
      </div>

      <div
        style={{
          marginBottom: spacing['4xl'],
          padding: spacing.lg,
          border: `1px solid ${colors.border.primary}`,
          borderRadius: '4px'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: spacing.md,
            alignItems: 'center',
            marginBottom: spacing.md
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                marginBottom: spacing.xs,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.primary
              }}
            >
              Modèles offline
            </h3>
            <p style={{ margin: 0, fontSize: typography.fontSize.xs, color: colors.text.tertiary }}>
              Cliquer sur un modèle lance son téléchargement automatique.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadOfflineModelStatus}
            disabled={isModelsLoading || isDownloadInProgress}
          >
            {isModelsLoading ? 'Chargement...' : 'Actualiser'}
          </Button>
        </div>

        {modelsDir && (
          <div style={{ marginBottom: spacing.md }}>
            <div
              style={{
                fontSize: typography.fontSize.xs,
                color: colors.text.tertiary,
                marginBottom: spacing.xs
              }}
            >
              Dossier local détecté :
            </div>
            <code
              style={{
                display: 'block',
                fontSize: typography.fontSize.xs,
                color: colors.text.secondary,
                backgroundColor: colors.background.secondary + '40',
                padding: spacing.sm,
                borderRadius: '2px',
                wordBreak: 'break-all'
              }}
            >
              {modelsDir}
            </code>
          </div>
        )}

        {modelsError && (
          <div
            style={{
              marginBottom: spacing.md,
              fontSize: typography.fontSize.xs,
              color: colors.state.error
            }}
          >
            {modelsError}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
          {OFFLINE_MODEL_OPTIONS.map((model) => {
            const isInstalled = installedOfflineModels.includes(model.id)
            const isSelected = model.id === offlineModelId
            const isDownloadingThisModel =
              downloadState.modelId === model.id && isDownloadInProgress

            return (
              <button
                key={model.id}
                type="button"
                onClick={() => handleSelectOfflineModel(model.id)}
                disabled={isDownloadInProgress && !isDownloadingThisModel}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderRadius: '4px',
                  border: `1px solid ${isSelected ? colors.text.primary : colors.border.primary}`,
                  backgroundColor: isSelected ? colors.background.secondary + '60' : 'transparent',
                  padding: spacing.md,
                  cursor: isDownloadInProgress && !isDownloadingThisModel ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                  opacity: isDownloadInProgress && !isDownloadingThisModel ? 0.6 : 1
                }}
              >
                <div>
                  <div style={{ fontSize: typography.fontSize.sm, color: colors.text.primary }}>
                    {model.label}
                  </div>
                  <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary }}>
                    {model.engine} - {model.size}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: typography.fontSize.xs,
                    color: isInstalled ? colors.state.success : colors.text.tertiary
                  }}
                >
                  {getModelStatusLabel(model.id, isInstalled)}
                </div>
              </button>
            )
          })}
        </div>

        {!isOpenAIMode && selectedOfflineModel && (
          <div
            style={{
              marginTop: spacing.md,
              fontSize: typography.fontSize.xs,
              color: selectedModelInstalled ? colors.text.secondary : colors.state.error
            }}
          >
            {downloadState.modelId === selectedOfflineModel.id && isDownloadInProgress
              ? `Téléchargement de ${selectedOfflineModel.label} en cours...`
              : selectedModelInstalled
                ? `${selectedOfflineModel.label} est détecté. L'exécution locale sera branchée à l'étape suivante.`
                : `${selectedOfflineModel.label} n'est pas détecté dans le dossier des modèles.`}
          </div>
        )}
      </div>

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
          Clé API OpenAI
        </h2>
        <p
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.tertiary,
            margin: 0
          }}
        >
          {isOpenAIMode
            ? hasApiKey && !showApiKeyEditor
              ? 'Stockée et chiffrée'
              : 'Requise pour la transcription cloud'
            : 'Optionnelle tant que vous restez en mode offline'}
        </p>
      </div>

      {hasApiKey && !showApiKeyEditor ? (
        <ApiKeyViewMode
          onEdit={() => setIsEditing(true)}
          onDelete={() => setShowDeleteConfirm(true)}
        />
      ) : showApiKeyEditor ? (
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
      ) : (
        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
          Ajouter une clé OpenAI (optionnel)
        </Button>
      )}

      {showDeleteConfirm && (
        <DeleteConfirmModal
          title="Supprimer la clé ?"
          message={isOpenAIMode ? 'La transcription cloud sera désactivée.' : 'La clé sera supprimée.'}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  )
}
