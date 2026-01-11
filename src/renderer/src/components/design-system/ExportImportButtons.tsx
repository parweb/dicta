import { Download, Upload, RotateCcw } from 'lucide-react';
import { useRef, useState } from 'react';

import { useTheme } from '../../lib/theme-context';
import { downloadThemeFile, readThemeFile } from '../../lib/theme-utils';

export default function ExportImportButtons() {
  const { theme, baseConfig, replaceTheme, resetTheme, setActivePreset } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleExport = () => {
    try {
      downloadThemeFile(baseConfig, `dicta-theme-${Date.now()}.json`);
      showMessage('Thème exporté avec succès', 'success');
    } catch (error) {
      showMessage('Erreur lors de l\'export', 'error');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await readThemeFile(file);

    if (result.success) {
      replaceTheme(result.theme);
      setActivePreset('custom');
      showMessage('Thème importé avec succès', 'success');
    } else {
      showMessage(`Erreur: ${result.error}`, 'error');
    }

    // Reset input to allow reimporting the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser le thème aux valeurs par défaut ?')) {
      resetTheme();
      showMessage('Thème réinitialisé', 'success');
    }
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.md
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
        Gestion du Thème
      </h3>

      <div
        style={{
          display: 'flex',
          gap: theme.spacing.md,
          flexWrap: 'wrap'
        }}
      >
        {/* Export button */}
        <button
          onClick={handleExport}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.sm,
            padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
            backgroundColor: theme.colors.accent.blue.primary,
            color: theme.colors.text.primary,
            border: 'none',
            borderRadius: theme.borderRadius.sm,
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.accent.blue.light;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.accent.blue.primary;
          }}
        >
          <Download size={16} />
          Exporter
        </button>

        {/* Import button */}
        <button
          onClick={handleImportClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.sm,
            padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
            backgroundColor: theme.colors.background.tertiary,
            color: theme.colors.text.primary,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borderRadius.sm,
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.background.secondary;
            e.currentTarget.style.borderColor = theme.colors.border.secondary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.background.tertiary;
            e.currentTarget.style.borderColor = theme.colors.border.primary;
          }}
        >
          <Upload size={16} />
          Importer
        </button>

        {/* Reset button */}
        <button
          onClick={handleReset}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.sm,
            padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
            backgroundColor: theme.colors.background.tertiary,
            color: theme.colors.accent.red.primary,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borderRadius.sm,
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.background.secondary;
            e.currentTarget.style.borderColor = theme.colors.accent.red.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.background.tertiary;
            e.currentTarget.style.borderColor = theme.colors.border.primary;
          }}
        >
          <RotateCcw size={16} />
          Réinitialiser
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportFile}
          style={{ display: 'none' }}
        />
      </div>

      {/* Status message */}
      {message && (
        <div
          style={{
            padding: theme.spacing.md,
            backgroundColor:
              message.type === 'success'
                ? theme.colors.accent.green.primary + '20'
                : theme.colors.accent.red.primary + '20',
            border: `1px solid ${message.type === 'success' ? theme.colors.state.success : theme.colors.state.error}`,
            borderRadius: theme.borderRadius.sm,
            fontSize: theme.typography.fontSize.sm,
            color:
              message.type === 'success'
                ? theme.colors.state.success
                : theme.colors.state.error,
            animation: 'fadeIn 0.2s ease-in'
          }}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
