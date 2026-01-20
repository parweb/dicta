/**
 * Bedrock History Display Variants
 * Different UI approaches to show visual indicators that Bedrock actions were executed
 * These are compact indicators that encourage users to click "Actions" to see full history
 */

import { Calendar, FileText, Mail, Search, Sparkles } from 'lucide-react'
import type { BedrockConversationHistory } from '@/lib/history'

interface BedrockHistoryDisplayProps {
  history: BedrockConversationHistory
  variant: string
  onClick?: () => void
}

const getToolIcon = (toolName: string) => {
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
      return Sparkles
  }
}

const getToolLabel = (toolName: string) => {
  switch (toolName) {
    case 'add_to_calendar':
      return 'Calendrier'
    case 'save_as_note':
      return 'Note'
    case 'send_email':
      return 'Email'
    case 'search_web':
      return 'Recherche'
    default:
      return toolName
  }
}

export default function BedrockHistoryDisplay({ history, variant, onClick }: BedrockHistoryDisplayProps) {
  const toolsCount = history.toolsExecuted.length
  const uniqueTools = Array.from(new Set(history.toolsExecuted.map((t) => t.name)))

  // Variant 1: Simple Badge
  if (variant === 'accordion') {
    return (
      <button
        onClick={onClick}
        className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-md text-sm text-blue-400 transition-colors"
      >
        <Sparkles size={14} />
        <span>{toolsCount} action(s) exécutée(s)</span>
        <span className="text-xs text-slate-500">• Cliquer pour voir</span>
      </button>
    )
  }

  // Variant 2: Compact Badge
  if (variant === 'badge') {
    return (
      <button
        onClick={onClick}
        className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-xs text-blue-400 hover:bg-blue-500/20 transition-colors"
      >
        <Sparkles size={12} />
        <span>{toolsCount} action(s)</span>
      </button>
    )
  }

  // Variant 3: Icon Timeline Strip
  if (variant === 'timeline') {
    return (
      <button
        onClick={onClick}
        className="mt-2 flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-1">
          {uniqueTools.slice(0, 4).map((toolName, idx) => {
            const Icon = getToolIcon(toolName)
            return (
              <div
                key={idx}
                className="w-6 h-6 rounded bg-blue-500/20 border border-blue-500/40 flex items-center justify-center"
              >
                <Icon size={12} className="text-blue-400" />
              </div>
            )
          })}
          {toolsCount > 4 && (
            <span className="text-xs text-slate-500">+{toolsCount - 4}</span>
          )}
        </div>
        <span className="text-xs text-slate-400">{toolsCount} action(s)</span>
      </button>
    )
  }

  // Variant 4: Card Badge
  if (variant === 'card') {
    return (
      <button
        onClick={onClick}
        className="mt-2 w-full text-left p-2.5 bg-blue-500/5 border border-blue-500/20 rounded-lg hover:bg-blue-500/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-blue-400" />
          <span className="text-sm text-slate-300">{toolsCount} action(s) exécutée(s)</span>
        </div>
      </button>
    )
  }

  // Variant 5: Stacked Icons
  if (variant === 'stacked') {
    return (
      <button
        onClick={onClick}
        className="mt-2 flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <div className="flex -space-x-2">
          {uniqueTools.slice(0, 3).map((toolName, idx) => {
            const Icon = getToolIcon(toolName)
            return (
              <div
                key={idx}
                className="w-7 h-7 rounded-full bg-blue-500/20 border-2 border-slate-900 flex items-center justify-center"
              >
                <Icon size={12} className="text-blue-400" />
              </div>
            )
          })}
          {toolsCount > 3 && (
            <div className="w-7 h-7 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center">
              <span className="text-xs text-slate-300">+{toolsCount - 3}</span>
            </div>
          )}
        </div>
        <span className="text-xs text-slate-500">{toolsCount} action(s)</span>
      </button>
    )
  }

  // Variant 6: Progress Indicator
  if (variant === 'progress') {
    return (
      <button
        onClick={onClick}
        className="mt-2 w-full hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-400">Actions IA</span>
          <span className="text-xs text-blue-400">{toolsCount} exécutée(s)</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: '100%' }} />
        </div>
      </button>
    )
  }

  // Variant 7: Compact Inline List
  if (variant === 'compact') {
    return (
      <button
        onClick={onClick}
        className="mt-2 flex flex-wrap items-center gap-1.5 hover:opacity-80 transition-opacity"
      >
        <Sparkles size={12} className="text-blue-400" />
        {uniqueTools.slice(0, 4).map((toolName, idx) => {
          const Icon = getToolIcon(toolName)
          return (
            <div
              key={idx}
              className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-800 rounded text-xs text-slate-400"
            >
              <Icon size={10} />
              {getToolLabel(toolName)}
            </div>
          )
        })}
        {toolsCount > 4 && (
          <span className="text-xs text-slate-500">+{toolsCount - 4}</span>
        )}
      </button>
    )
  }

  // Variant 8: Sidebar Accent
  if (variant === 'sidebar') {
    return (
      <button
        onClick={onClick}
        className="mt-2 flex gap-2 w-full hover:opacity-80 transition-opacity"
      >
        <div className="w-1 bg-blue-500 rounded-full" />
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Sparkles size={12} />
            <span>{toolsCount} actions exécutées</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {uniqueTools.slice(0, 3).map((toolName, idx) => {
              const Icon = getToolIcon(toolName)
              return (
                <div key={idx} className="flex items-center gap-1 text-xs text-slate-500">
                  <Icon size={10} className="text-blue-400" />
                  {getToolLabel(toolName)}
                </div>
              )
            })}
          </div>
        </div>
      </button>
    )
  }

  // Variant 9: Prominent Button
  if (variant === 'modal') {
    return (
      <button
        onClick={onClick}
        className="mt-2 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-md text-sm text-blue-400 transition-colors flex items-center gap-2 w-full justify-center"
      >
        <Sparkles size={14} />
        <span>Voir les {toolsCount} action(s) exécutée(s)</span>
      </button>
    )
  }

  // Variant 10: Chips/Tags
  if (variant === 'chips') {
    return (
      <button
        onClick={onClick}
        className="mt-2 w-full text-left hover:opacity-80 transition-opacity"
      >
        <div className="text-xs text-slate-400 mb-1.5 flex items-center gap-1">
          <Sparkles size={11} />
          Actions IA ({toolsCount})
        </div>
        <div className="flex flex-wrap gap-1.5">
          {uniqueTools.slice(0, 5).map((toolName, idx) => {
            const Icon = getToolIcon(toolName)
            return (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-xs text-blue-400"
              >
                <Icon size={11} />
                {getToolLabel(toolName)}
              </div>
            )
          })}
        </div>
      </button>
    )
  }

  return null
}
