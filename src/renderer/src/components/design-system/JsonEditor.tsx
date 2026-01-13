import { AlertCircle, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

import { useTheme } from '../../lib/theme-context';
import { validateTheme } from '../../lib/theme-schema';

export default function JsonEditor() {
  const { theme, baseConfig, replaceTheme, setActivePreset } = useTheme();
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);

  // Initialize JSON text from current theme
  useEffect(() => {
    setJsonText(JSON.stringify(baseConfig, null, 2));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setJsonText(newText);

    // Try to parse and validate
    try {
      const parsed = JSON.parse(newText);
      const validation = validateTheme(parsed);

      if (validation.success) {
        setError(null);
        setIsValid(true);
        replaceTheme(validation.theme);
        setActivePreset('custom');
      } else {
        setError(validation.error);
        setIsValid(false);
      }
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError(`Erreur de syntaxe JSON: ${err.message}`);
      } else {
        setError('Erreur de parsing');
      }
      setIsValid(false);
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
    } catch (err) {
      // If can't parse, don't format
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.md,
        height: '100%'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <h3
          style={{
            fontSize: theme.typography.fontSize.base,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary,
            margin: 0
          }}
        >
          Éditeur JSON
        </h3>

        <button
          onClick={handleFormat}
          style={{
            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
            backgroundColor: theme.colors.background.tertiary,
            color: theme.colors.text.primary,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borderRadius.sm,
            fontSize: theme.typography.fontSize.sm,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor =
              theme.colors.background.secondary;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor =
              theme.colors.background.tertiary;
          }}
        >
          Formater
        </button>
      </div>

      <p
        style={{
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.text.tertiary,
          margin: 0
        }}
      >
        Modifiez directement la configuration JSON du thème. Les changements
        sont appliqués en temps réel.
      </p>

      {/* Status indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.sm,
          padding: theme.spacing.sm,
          backgroundColor: isValid
            ? 'rgba(74, 222, 128, 0.1)'
            : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${isValid ? theme.colors.state.success : theme.colors.state.error}`,
          borderRadius: theme.borderRadius.sm,
          fontSize: theme.typography.fontSize.sm
        }}
      >
        {isValid ? (
          <>
            <Check size={16} color={theme.colors.state.success} />
            <span style={{ color: theme.colors.state.success }}>
              JSON valide - changements appliqués
            </span>
          </>
        ) : (
          <>
            <AlertCircle size={16} color={theme.colors.state.error} />
            <span style={{ color: theme.colors.state.error }}>
              JSON invalide - corrigez les erreurs ci-dessous
            </span>
          </>
        )}
      </div>

      {/* JSON textarea */}
      <textarea
        value={jsonText}
        onChange={handleChange}
        spellCheck={false}
        style={{
          flex: 1,
          minHeight: '400px',
          padding: theme.spacing.md,
          backgroundColor: theme.colors.background.primary,
          color: theme.colors.text.primary,
          border: `1px solid ${error ? theme.colors.state.error : theme.colors.border.primary}`,
          borderRadius: theme.borderRadius.sm,
          fontSize: theme.typography.fontSize.sm,
          fontFamily: 'monospace',
          lineHeight: theme.typography.lineHeight.relaxed,
          resize: 'vertical',
          outline: 'none',
          whiteSpace: 'pre',
          overflowX: 'auto'
        }}
        onFocus={e => {
          if (!error) {
            e.currentTarget.style.borderColor = theme.colors.border.accent;
          }
        }}
        onBlur={e => {
          if (!error) {
            e.currentTarget.style.borderColor = theme.colors.border.primary;
          }
        }}
      />

      {/* Error display */}
      {error && (
        <div
          style={{
            padding: theme.spacing.md,
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${theme.colors.state.error}`,
            borderRadius: theme.borderRadius.sm,
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.state.error,
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          <strong>Erreur:</strong> {error}
        </div>
      )}

      {/* Help text */}
      <div
        style={{
          padding: theme.spacing.md,
          backgroundColor: theme.colors.accent.blue.background,
          border: `1px solid ${theme.colors.accent.blue.primary}`,
          borderRadius: theme.borderRadius.sm,
          fontSize: theme.typography.fontSize.xs,
          color: theme.colors.text.secondary
        }}
      >
        <strong style={{ color: theme.colors.accent.blue.primary }}>
          Astuce:
        </strong>{' '}
        Utilisez Ctrl+Z pour annuler les modifications. Le thème est
        automatiquement sauvegardé après chaque modification valide.
      </div>
    </div>
  );
}
