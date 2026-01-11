import { useTheme } from '../../lib/theme-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import ExportImportButtons from './ExportImportButtons';
import JsonEditor from './JsonEditor';
import PresetSelector from './PresetSelector';
import VisualEditor from './VisualEditor';

export default function ThemeConfigurator() {
  const { theme } = useTheme();
  const { colors, spacing, typography, borderRadius } = theme;

  return (
    <div
      style={{
        width: '100%',
        marginBottom: spacing['4xl']
      }}
    >
      {/* Header - Minimaliste */}
      <div
        style={{
          marginBottom: spacing['3xl']
        }}
      >
        <h1
          style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            marginBottom: spacing.sm
          }}
        >
          Configurateur de Thème
        </h1>
        <p
          style={{
            fontSize: typography.fontSize.base,
            color: colors.text.tertiary,
            lineHeight: typography.lineHeight.relaxed
          }}
        >
          Personnalisez l'apparence de Dicta. Les modifications sont appliquées en temps réel et
          sauvegardées automatiquement.
        </p>
      </div>

      {/* Preset Selector - Plus épuré */}
      <div
        style={{
          marginBottom: spacing['3xl']
        }}
      >
        <PresetSelector />
      </div>

      {/* Export/Import - En ligne, plus discret */}
      <div
        style={{
          marginBottom: spacing['3xl']
        }}
      >
        <ExportImportButtons />
      </div>

      {/* Tabs - Style épuré */}
      <Tabs defaultValue="visual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="visual">Éditeur Visuel</TabsTrigger>
          <TabsTrigger value="json">Éditeur JSON</TabsTrigger>
        </TabsList>

        <TabsContent value="visual">
          <div
            style={{
              paddingTop: spacing['2xl']
            }}
          >
            <VisualEditor />
          </div>
        </TabsContent>

        <TabsContent value="json">
          <div
            style={{
              paddingTop: spacing['2xl'],
              paddingBottom: spacing['2xl']
            }}
          >
            <JsonEditor />
          </div>
        </TabsContent>
      </Tabs>

      {/* Séparateur subtil */}
      <div
        style={{
          marginTop: spacing['4xl'],
          height: '1px',
          background: `linear-gradient(to right, transparent, ${colors.border.primary}, transparent)`
        }}
      />
    </div>
  );
}
