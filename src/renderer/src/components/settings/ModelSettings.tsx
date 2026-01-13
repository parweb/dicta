import { useState, useEffect } from 'react';
import { Key, Trash2, Check, AlertCircle, Shield, ShieldOff } from 'lucide-react';

import { useApiKey } from '../../lib/api-key-context';
import { useTheme } from '../../lib/theme-context';

export default function ModelSettings() {
  const { theme } = useTheme();
  const { colors, spacing, typography, components } = theme;
  const {
    apiKey,
    hasApiKey,
    isEncryptionAvailable,
    saveApiKey,
    deleteApiKey
  } = useApiKey();

  const [inputValue, setInputValue] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [hasEnvKey, setHasEnvKey] = useState(false);

  // Check for env variable on mount
  useEffect(() => {
    const envKey = import.meta.env.VITE_OPENAI_API_KEY;
    setHasEnvKey(!!envKey && envKey !== '');
  }, []);

  const handleSave = async () => {
    if (!inputValue.trim()) {
      setError('Veuillez entrer une clé API');
      return;
    }

    setIsSaving(true);
    setError(null);

    const result = await saveApiKey(inputValue.trim());

    if (result.success) {
      setSaveSuccess(true);
      setInputValue('');
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setError(result.error || 'Erreur lors de la sauvegarde');
    }

    setIsSaving(false);
  };

  const handleDelete = async () => {
    const result = await deleteApiKey();
    if (result.success) {
      setShowDeleteConfirm(false);
    } else {
      setError(result.error || 'Erreur lors de la suppression');
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: spacing['2xl'] }}>
        <h2
          style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            marginBottom: spacing.sm
          }}
        >
          Configuration du Modèle
        </h2>
        <p
          style={{
            fontSize: typography.fontSize.base,
            color: colors.text.tertiary,
            lineHeight: typography.lineHeight.relaxed
          }}
        >
          Configurez votre clé API OpenAI pour utiliser la transcription vocale
        </p>
      </div>

      {/* Encryption Status */}
      <div
        style={{
          ...components.card.base,
          marginBottom: spacing.xl,
          padding: spacing.md,
          display: 'flex',
          alignItems: 'center',
          gap: spacing.sm,
          backgroundColor: isEncryptionAvailable
            ? colors.state.success + '20'
            : colors.state.error + '20'
        }}
      >
        {isEncryptionAvailable ? (
          <Shield size={18} color={colors.state.success} />
        ) : (
          <ShieldOff size={18} color={colors.state.error} />
        )}
        <span
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary
          }}
        >
          {isEncryptionAvailable
            ? 'Chiffrement sécurisé disponible'
            : 'Chiffrement non disponible - stockage en texte brut'}
        </span>
      </div>

      {/* Migration Banner */}
      {hasEnvKey && (
        <div
          style={{
            ...components.card.base,
            marginBottom: spacing.xl,
            padding: spacing.md,
            backgroundColor: colors.accent.yellow + '20',
            borderLeft: `4px solid ${colors.accent.yellow}`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'start', gap: spacing.sm }}>
            <AlertCircle
              size={18}
              color={colors.accent.yellow}
              style={{ marginTop: '2px' }}
            />
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.text.primary,
                  marginBottom: spacing.xs
                }}
              >
                Clé API détectée dans .env (non sécurisé)
              </p>
              <p
                style={{
                  fontSize: typography.fontSize.xs,
                  color: colors.text.tertiary,
                  marginBottom: spacing.sm
                }}
              >
                Migrez vers le stockage sécurisé et supprimez le fichier .env
              </p>
              <button
                onClick={() => {
                  const envKey = import.meta.env.VITE_OPENAI_API_KEY;
                  if (envKey) {
                    setInputValue(envKey);
                  }
                }}
                style={{
                  ...components.button.base,
                  fontSize: typography.fontSize.xs,
                  padding: `${spacing.xs}px ${spacing.sm}px`
                }}
              >
                Migrer maintenant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Key Status */}
      {hasApiKey && (
        <div
          style={{
            ...components.card.base,
            marginBottom: spacing.xl,
            padding: spacing.md,
            display: 'flex',
            alignItems: 'center',
            gap: spacing.sm,
            backgroundColor: colors.state.success + '20'
          }}
        >
          <Check size={18} color={colors.state.success} />
          <span
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.secondary
            }}
          >
            Clé API configurée
          </span>
        </div>
      )}

      {/* API Key Input Form */}
      <div style={{ ...components.card.base, padding: spacing.xl }}>
        <div style={{ marginBottom: spacing.lg }}>
          <label
            style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.primary,
              marginBottom: spacing.sm
            }}
          >
            Clé API OpenAI
          </label>

          <div style={{ position: 'relative' }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="sk-..."
              style={{
                ...components.input.base,
                paddingRight: spacing['3xl']
              }}
            />
            <button
              onClick={() => setShowKey(!showKey)}
              style={{
                position: 'absolute',
                right: spacing.sm,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: colors.text.tertiary,
                fontSize: typography.fontSize.xs
              }}
            >
              {showKey ? 'Masquer' : 'Afficher'}
            </button>
          </div>

          <p
            style={{
              fontSize: typography.fontSize.xs,
              color: colors.text.tertiary,
              marginTop: spacing.xs
            }}
          >
            Obtenez votre clé sur{' '}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: colors.accent.blue,
                textDecoration: 'underline'
              }}
            >
              platform.openai.com/api-keys
            </a>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              padding: spacing.sm,
              backgroundColor: colors.state.error + '20',
              borderRadius: components.card.base.borderRadius,
              marginBottom: spacing.md
            }}
          >
            <p
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.state.error
              }}
            >
              {error}
            </p>
          </div>
        )}

        {/* Success Message */}
        {saveSuccess && (
          <div
            style={{
              padding: spacing.sm,
              backgroundColor: colors.state.success + '20',
              borderRadius: components.card.base.borderRadius,
              marginBottom: spacing.md,
              display: 'flex',
              alignItems: 'center',
              gap: spacing.xs
            }}
          >
            <Check size={16} color={colors.state.success} />
            <p
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.state.success
              }}
            >
              Clé API sauvegardée avec succès
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: spacing.md }}>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              ...components.button.base,
              ...components.button.primary,
              flex: 1,
              opacity: isSaving ? 0.6 : 1
            }}
          >
            {isSaving
              ? 'Enregistrement...'
              : hasApiKey
                ? 'Mettre à jour'
                : 'Enregistrer'}
          </button>

          {hasApiKey && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                ...components.button.base,
                backgroundColor: colors.state.error,
                display: 'flex',
                alignItems: 'center',
                gap: spacing.xs
              }}
            >
              <Trash2 size={16} />
              Supprimer
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            style={{
              ...components.card.base,
              padding: spacing.xl,
              maxWidth: '400px',
              margin: spacing.md
            }}
          >
            <h3
              style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
                marginBottom: spacing.md
              }}
            >
              Supprimer la clé API ?
            </h3>
            <p
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
                marginBottom: spacing.xl
              }}
            >
              Vous ne pourrez plus utiliser la transcription vocale tant
              qu'une nouvelle clé n'est pas configurée.
            </p>
            <div style={{ display: 'flex', gap: spacing.md }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  ...components.button.base,
                  flex: 1
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                style={{
                  ...components.button.base,
                  backgroundColor: colors.state.error,
                  flex: 1
                }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
