/**
 * Tool Execution Status Component
 * Displays real-time status of tool executions
 */

import { Calendar, FileText, Loader2, Mail, Search } from 'lucide-react'

import { useTheme } from '../../lib/theme-context'
import type { ToolExecution } from '../../lib/bedrock/types'

interface ToolExecutionStatusProps {
  tools: ToolExecution[]
}

/**
 * Get icon for tool by name
 */
function getToolIcon(toolName: string) {
  switch (toolName) {
    case 'add_to_calendar':
      return Calendar
    case 'save_as_note':
      return FileText
    case 'send_email':
      return Mail
    case 'search_web':
      return Search
    default:
      return FileText
  }
}

/**
 * Get human-readable tool name
 */
function getToolDisplayName(toolName: string): string {
  switch (toolName) {
    case 'add_to_calendar':
      return 'Ajout au calendrier'
    case 'save_as_note':
      return 'Sauvegarde de note'
    case 'send_email':
      return 'Création email'
    case 'search_web':
      return 'Recherche web'
    default:
      return toolName
  }
}

export default function ToolExecutionStatus({ tools }: ToolExecutionStatusProps) {
  const { theme } = useTheme()
  const { colors, spacing, typography } = theme

  if (tools.length === 0) {
    return null
  }

  return (
    <div
      style={{
        marginTop: spacing.lg,
        marginBottom: spacing.lg
      }}
    >
      <h3
        style={{
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          color: colors.text.secondary,
          marginBottom: spacing.md,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}
      >
        Outils exécutés
      </h3>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.sm
        }}
      >
        {tools.map((tool) => {
          const Icon = getToolIcon(tool.name)
          const displayName = getToolDisplayName(tool.name)

          // Determine colors based on status
          let iconColor = colors.text.tertiary
          let bgColor = colors.background.secondary + '20'
          let borderColor = colors.border.primary

          if (tool.status === 'running') {
            iconColor = colors.accent.blue.primary
            bgColor = colors.accent.blue.background
            borderColor = colors.accent.blue.primary + '40'
          } else if (tool.status === 'success') {
            iconColor = colors.state.success
            bgColor = colors.state.success + '10'
            borderColor = colors.state.success + '40'
          } else if (tool.status === 'error') {
            iconColor = colors.state.error
            bgColor = colors.state.error + '10'
            borderColor = colors.state.error + '40'
          }

          return (
            <div
              key={tool.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.md,
                padding: spacing.md,
                backgroundColor: bgColor,
                border: `1px solid ${borderColor}`,
                borderRadius: '2px',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Icon or Spinner */}
              <div
                style={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {tool.status === 'running' ? (
                  <Loader2 size={16} color={iconColor} className="animate-spin" />
                ) : (
                  <Icon size={16} color={iconColor} />
                )}
              </div>

              {/* Tool Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.text.primary,
                    marginBottom: spacing.xs
                  }}
                >
                  {displayName}
                </div>

                {/* Result or Error Message */}
                {tool.result && (
                  <div
                    style={{
                      fontSize: typography.fontSize.xs,
                      color: colors.text.secondary,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontFamily: 'monospace',
                      backgroundColor: colors.background.primary + '40',
                      padding: spacing.sm,
                      borderRadius: '2px',
                      marginTop: spacing.xs,
                      userSelect: 'text',
                      cursor: 'text'
                    }}
                  >
                    {tool.result}
                  </div>
                )}

                {tool.error && (
                  <div
                    style={{
                      fontSize: typography.fontSize.xs,
                      color: colors.state.error,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontFamily: 'monospace',
                      backgroundColor: colors.state.error + '10',
                      padding: spacing.sm,
                      borderRadius: '2px',
                      marginTop: spacing.xs,
                      userSelect: 'text',
                      cursor: 'text'
                    }}
                  >
                    Erreur: {tool.error}
                  </div>
                )}

                {tool.status === 'pending' && (
                  <div
                    style={{
                      fontSize: typography.fontSize.xs,
                      color: colors.text.tertiary
                    }}
                  >
                    En attente...
                  </div>
                )}

                {tool.status === 'running' && !tool.result && (
                  <div
                    style={{
                      fontSize: typography.fontSize.xs,
                      color: colors.accent.blue.primary
                    }}
                  >
                    Exécution en cours...
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
