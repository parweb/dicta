import { useState, useEffect } from 'react';
import { Key, Trash2 } from 'lucide-react';

import { useApiKey } from '../../lib/api-key-context';
import { useTheme } from '../../lib/theme-context';
import { Button } from '../ui/button';

export default function ModelSettings() {
  const { theme } = useTheme();
  const { colors, spacing, typography } = theme;
  const { hasApiKey, saveApiKey, deleteApiKey } = useApiKey();

  const [isEditing, setIsEditing] = useState(!hasApiKey);
  const [inputValue, setInputValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (hasApiKey && isSaving) {
      setTimeout(() => {
        setIsEditing(false);
        setIsSaving(false);
      }, 300);
    }
  }, [hasApiKey, isSaving]);

  const handleSave = async () => {
    if (!inputValue.trim()) {
      setError('Clé requise');
      return;
    }

    setIsSaving(true);
    setError(null);

    const result = await saveApiKey(inputValue.trim());

    if (!result.success) {
      setError(result.error || 'Erreur');
      setIsSaving(false);
    } else {
      setInputValue('');
    }
  };

  const handleDelete = async () => {
    const result = await deleteApiKey();
    if (result.success) {
      setShowDeleteConfirm(false);
      setIsEditing(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      handleSave();
    } else if (e.key === 'Escape' && hasApiKey) {
      setIsEditing(false);
      setInputValue('');
      setError(null);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '480px' }}>
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
          Clé API
        </h2>
        <p
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.tertiary,
            margin: 0
          }}
        >
          {hasApiKey && !isEditing
            ? 'Stockée et chiffrée'
            : 'Requise pour la transcription'}
        </p>
      </div>

      {/* Content */}
      {hasApiKey && !isEditing ? (
        // View Mode
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.md,
              padding: spacing.lg,
              backgroundColor: colors.background.secondary + '40',
              borderRadius: '2px',
              marginBottom: spacing.lg
            }}
          >
            <Key size={16} color={colors.text.tertiary} />
            <span
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
                fontFamily: 'monospace',
                flex: 1
              }}
            >
              sk-••••••••••••••
            </span>
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

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Supprimer
            </Button>
          </div>
        </div>
      ) : (
        // Edit Mode
        <div>
          <input
            type="password"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
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
            onFocus={e =>
              (e.currentTarget.style.borderColor = colors.text.tertiary)
            }
            onBlur={e =>
              (e.currentTarget.style.borderColor = colors.border.primary)
            }
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
            <Button
              onClick={handleSave}
              disabled={!inputValue.trim() || isSaving}
              size="sm"
              className="flex-1"
            >
              {isSaving ? 'Enregistrement' : 'Enregistrer'}
            </Button>

            {hasApiKey && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setInputValue('');
                  setError(null);
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
            onClick={e => e.stopPropagation()}
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
              Supprimer la clé ?
            </h3>
            <p
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
                margin: 0,
                marginBottom: spacing.lg
              }}
            >
              La transcription sera désactivée.
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
  );
}
