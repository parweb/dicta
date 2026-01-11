import { useTheme } from '../../lib/theme-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import ExportImportButtons from './ExportImportButtons';
import JsonEditor from './JsonEditor';
import PresetSelector from './PresetSelector';
import VisualEditor from './VisualEditor';

export default function ThemeConfigurator() {
  const { theme } = useTheme();

  return (
    <div
      style={{
        width: '100%',
        padding: theme.spacing['2xl'],
        backgroundColor: theme.colors.background.secondary,
        borderRadius: theme.borderRadius.lg,
        border: `1px solid ${theme.colors.border.primary}`
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: theme.spacing.xl
        }}
      >
        <h2
          style={{
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.sm
          }}
        >
          Configurateur de Thème
        </h2>
        <p
          style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.tertiary,
            margin: 0
          }}
        >
          Personnalisez l'apparence de Dicta avec des thèmes prédéfinis ou créez votre propre
          thème. Les modifications sont sauvegardées automatiquement et appliquées en temps réel.
        </p>
      </div>

      {/* Preset Selector */}
      <div
        style={{
          marginBottom: theme.spacing.xl,
          padding: theme.spacing.lg,
          backgroundColor: theme.colors.background.primary,
          borderRadius: theme.borderRadius.md,
          border: `1px solid ${theme.colors.border.primary}`
        }}
      >
        <PresetSelector />
      </div>

      {/* Export/Import Buttons */}
      <div
        style={{
          marginBottom: theme.spacing.xl,
          padding: theme.spacing.lg,
          backgroundColor: theme.colors.background.primary,
          borderRadius: theme.borderRadius.md,
          border: `1px solid ${theme.colors.border.primary}`
        }}
      >
        <ExportImportButtons />
      </div>

      {/* Tabs for Visual Editor and JSON Editor */}
      <Tabs defaultValue="visual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="visual">Éditeur Visuel</TabsTrigger>
          <TabsTrigger value="json">Éditeur JSON</TabsTrigger>
        </TabsList>

        <TabsContent value="visual">
          <div
            style={{
              padding: theme.spacing.lg,
              backgroundColor: theme.colors.background.primary,
              borderRadius: theme.borderRadius.md,
              border: `1px solid ${theme.colors.border.primary}`
            }}
          >
            <VisualEditor />
          </div>
        </TabsContent>

        <TabsContent value="json">
          <div
            style={{
              padding: theme.spacing.lg,
              backgroundColor: theme.colors.background.primary,
              borderRadius: theme.borderRadius.md,
              border: `1px solid ${theme.colors.border.primary}`
            }}
          >
            <JsonEditor />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
