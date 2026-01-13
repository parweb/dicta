import { useState, useEffect } from 'react';
import { Key, Trash2, Check, AlertCircle, Shield, ShieldOff, Eye, EyeOff } from 'lucide-react';

import { useApiKey } from '../../lib/api-key-context';
import { useTheme } from '../../lib/theme-context';

export default function ModelSettings() {
  const { theme } = useTheme();
  const { colors, spacing, typography } = theme;
  const {
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isSaving) {
      handleSave();
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: spacing['3xl'] }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.md,
            marginBottom: spacing.md
          }}
        >
          <div style={{ color: colors.accent.blue.primary }}>
            <Key size={20} />
          </div>
          <h2
            style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              margin: 0
            }}
          >
            Configuration de l'API
          </h2>
        </div>
        <p
          style={{
            fontSize: typography.fontSize.base,
            color: colors.text.tertiary,
            lineHeight: typography.lineHeight.relaxed,
            margin: 0
          }}
        >
          Configurez votre clé API OpenAI pour utiliser la transcription vocale
        </p>
      </div>

      {/* Migration Banner */}
      {hasEnvKey && (
        <div
          style={{
            padding: spacing.lg,
            marginBottom: spacing['3xl'],
            backgroundColor: colors.accent.yellow + '15',
            borderLeft: `3px solid ${colors.accent.yellow}`,
            borderRadius: '4px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'start', gap: spacing.md }}>
            <AlertCircle
              size={20}
              color={colors.accent.yellow}
              style={{ flexShrink: 0, marginTop: '2px' }}
            />
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: typography.fontSize.base,
                  color: colors.text.primary,
                  marginBottom: spacing.xs,
                  fontWeight: typography.fontWeight.medium
                }}
              >
                Migration disponible
              </p>
              <p
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary,
                  marginBottom: spacing.md,
                  lineHeight: typography.lineHeight.relaxed
                }}
              >
                Une clé API a été détectée dans votre fichier .env. Pour plus de
                sécurité, migrez-la vers le stockage chiffré.
              </p>
              <button
                onClick={() => {
                  const envKey = import.meta.env.VITE_OPENAI_API_KEY;
                  if (envKey) {
                    setInputValue(envKey);
                  }
                }}
                style={{
                  padding: `${spacing.xs}px ${spacing.md}px`,
                  backgroundColor: colors.accent.yellow,
                  color: colors.background.primary,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Migrer maintenant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Indicators */}
      <div
        style={{
          display: 'flex',
          gap: spacing.lg,
          marginBottom: spacing['3xl']
        }}
      >
        {/* Encryption Status */}
        <div
          style={{
            flex: 1,
            padding: spacing.md,
            backgroundColor: isEncryptionAvailable
              ? colors.state.success + '10'
              : colors.state.error + '10',
            borderRadius: '4px',
            border: `1px solid ${isEncryptionAvailable ? colors.state.success + '30' : colors.state.error + '30'}`
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm
            }}
          >
            {isEncryptionAvailable ? (
              <Shield size={16} color={colors.state.success} />
            ) : (
              <ShieldOff size={16} color={colors.state.error} />
            )}
            <span
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary
              }}
            >
              {isEncryptionAvailable
                ? 'Chiffrement actif'
                : 'Chiffrement indisponible'}
            </span>
          </div>
        </div>

        {/* API Key Status */}
        {hasApiKey && (
          <div
            style={{
              flex: 1,
              padding: spacing.md,
              backgroundColor: colors.state.success + '10',
              borderRadius: '4px',
              border: `1px solid ${colors.state.success}30`
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.sm
              }}
            >
              <Check size={16} color={colors.state.success} />
              <span
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary
                }}
              >
                Clé API configurée
              </span>
            </div>
          </div>
        )}
      </div>

      {/* API Key Form */}
      <div style={{ marginBottom: spacing['3xl'] }}>
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

        <div style={{ position: 'relative', marginBottom: spacing.sm }}>
          <input
            type={showKey ? 'text' : 'password'}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="sk-..."
            style={{
              width: '100%',
              padding: spacing.md,
              paddingRight: spacing['4xl'],
              backgroundColor: colors.background.secondary,
              border: `1px solid ${colors.border.primary}`,
              borderRadius: '4px',
              color: colors.text.primary,
              fontSize: typography.fontSize.base,
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box'
            }}
            onFocus={e =>
              (e.currentTarget.style.borderColor = colors.accent.blue.primary)
            }
            onBlur={e =>
              (e.currentTarget.style.borderColor = colors.border.primary)
            }
          />
          <button
            onClick={() => setShowKey(!showKey)}
            style={{
              position: 'absolute',
              right: spacing.md,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: colors.text.tertiary,
              padding: spacing.xs,
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.2s'
            }}
            onMouseEnter={e =>
              (e.currentTarget.style.color = colors.text.secondary)
            }
            onMouseLeave={e =>
              (e.currentTarget.style.color = colors.text.tertiary)
            }
          >
            {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <p
          style={{
            fontSize: typography.fontSize.xs,
            color: colors.text.tertiary,
            lineHeight: typography.lineHeight.relaxed
          }}
        >
          Obtenez votre clé sur{' '}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: colors.accent.blue.primary,
              textDecoration: 'none',
              borderBottom: `1px solid ${colors.accent.blue.primary}40`,
              transition: 'border-color 0.2s'
            }}
            onMouseEnter={e =>
              (e.currentTarget.style.borderBottomColor =
                colors.accent.blue.primary)
            }
            onMouseLeave={e =>
              (e.currentTarget.style.borderBottomColor =
                colors.accent.blue.primary + '40')
            }
          >
            platform.openai.com/api-keys
          </a>
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div
          style={{
            padding: spacing.md,
            marginBottom: spacing.lg,
            backgroundColor: colors.state.error + '10',
            borderLeft: `3px solid ${colors.state.error}`,
            borderRadius: '4px'
          }}
        >
          <p
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.state.error,
              margin: 0
            }}
          >
            {error}
          </p>
        </div>
      )}

      {saveSuccess && (
        <div
          style={{
            padding: spacing.md,
            marginBottom: spacing.lg,
            backgroundColor: colors.state.success + '10',
            borderLeft: `3px solid ${colors.state.success}`,
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: spacing.sm
          }}
        >
          <Check size={16} color={colors.state.success} />
          <p
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.state.success,
              margin: 0
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
          disabled={isSaving || !inputValue.trim()}
          style={{
            flex: 1,
            padding: `${spacing.md}px ${spacing.lg}px`,
            backgroundColor: colors.accent.blue.primary,
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            cursor: isSaving || !inputValue.trim() ? 'not-allowed' : 'pointer',
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.medium,
            opacity: isSaving || !inputValue.trim() ? 0.5 : 1,
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={e => {
            if (!isSaving && inputValue.trim()) {
              e.currentTarget.style.opacity = '0.9';
            }
          }}
          onMouseLeave={e => {
            if (!isSaving && inputValue.trim()) {
              e.currentTarget.style.opacity = '1';
            }
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
              padding: `${spacing.md}px ${spacing.lg}px`,
              backgroundColor: colors.state.error + '20',
              color: colors.state.error,
              border: `1px solid ${colors.state.error}40`,
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.medium,
              display: 'flex',
              alignItems: 'center',
              gap: spacing.xs,
              transition: 'background-color 0.2s, border-color 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = colors.state.error + '30';
              e.currentTarget.style.borderColor = colors.state.error + '60';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = colors.state.error + '20';
              e.currentTarget.style.borderColor = colors.state.error + '40';
            }}
          >
            <Trash2 size={16} />
            Supprimer
          </button>
        )}
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
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            style={{
              backgroundColor: colors.background.secondary,
              border: `1px solid ${colors.border.primary}`,
              borderRadius: '8px',
              padding: spacing['2xl'],
              maxWidth: '400px',
              margin: spacing.md,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3
              style={{
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
                marginTop: 0,
                marginBottom: spacing.md
              }}
            >
              Supprimer la clé API ?
            </h3>
            <p
              style={{
                fontSize: typography.fontSize.base,
                color: colors.text.secondary,
                lineHeight: typography.lineHeight.relaxed,
                marginBottom: spacing['2xl']
              }}
            >
              Vous ne pourrez plus utiliser la transcription vocale tant qu'une
              nouvelle clé n'est pas configurée.
            </p>
            <div style={{ display: 'flex', gap: spacing.md }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1,
                  padding: `${spacing.md}px ${spacing.lg}px`,
                  backgroundColor: colors.background.tertiary,
                  color: colors.text.primary,
                  border: `1px solid ${colors.border.primary}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.backgroundColor =
                    colors.background.primary)
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.backgroundColor =
                    colors.background.tertiary)
                }
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                style={{
                  flex: 1,
                  padding: `${spacing.md}px ${spacing.lg}px`,
                  backgroundColor: colors.state.error,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
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
