/**
 * Bedrock History Display Variants
 * Different UI approaches to display Bedrock conversation history
 */

import { Calendar, FileText, Mail, Search, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import type { BedrockConversationHistory } from '@/lib/history'

interface BedrockHistoryDisplayProps {
  history: BedrockConversationHistory
  variant: string
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

export default function BedrockHistoryDisplay({ history, variant }: BedrockHistoryDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const toolsCount = history.toolsExecuted.length
  const uniqueTools = Array.from(new Set(history.toolsExecuted.map((t) => t.name)))

  // Variant 1: Simple Accordion
  if (variant === 'accordion') {
    return (
      <div className="mt-2 border border-slate-700 rounded-md overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-3 py-2 bg-slate-800 hover:bg-slate-750 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-blue-400" />
            <span className="text-sm text-slate-300">{toolsCount} action(s) exécutée(s)</span>
          </div>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {isExpanded && (
          <div className="p-3 bg-slate-900 space-y-2">
            {history.toolsExecuted.map((tool, idx) => {
              const Icon = getToolIcon(tool.name)
              return (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <Icon size={14} className="text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-slate-300 font-medium">{getToolLabel(tool.name)}</div>
                    {tool.result && <div className="text-slate-500 text-xs mt-1">{tool.result}</div>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Variant 2: Badge with Tooltip
  if (variant === 'badge') {
    return (
      <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-xs text-blue-400 hover:bg-blue-500/20 transition-colors cursor-pointer group relative">
        <Sparkles size={12} />
        <span>{toolsCount} action(s)</span>
        <div className="absolute top-full left-0 mt-2 p-3 bg-slate-800 border border-slate-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all w-64 z-10">
          {history.toolsExecuted.map((tool, idx) => {
            const Icon = getToolIcon(tool.name)
            return (
              <div key={idx} className="flex items-center gap-2 text-sm mb-2 last:mb-0">
                <Icon size={14} className="text-blue-400" />
                <span className="text-slate-300">{getToolLabel(tool.name)}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Variant 3: Mini Timeline
  if (variant === 'timeline') {
    return (
      <div className="mt-2 pl-3 border-l-2 border-blue-500/30 space-y-2">
        {history.toolsExecuted.map((tool, idx) => {
          const Icon = getToolIcon(tool.name)
          return (
            <div key={idx} className="flex items-start gap-2 text-sm -ml-[9px]">
              <div className="w-4 h-4 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center flex-shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              </div>
              <div className="flex items-center gap-2 pt-0.5">
                <Icon size={14} className="text-blue-400" />
                <span className="text-slate-300">{getToolLabel(tool.name)}</span>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Variant 4: Collapsible Card
  if (variant === 'card') {
    return (
      <div className="mt-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-left p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg hover:bg-blue-500/10 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-blue-400" />
              <span className="text-sm font-medium text-slate-300">Actions IA</span>
              <span className="text-xs text-slate-500">({toolsCount})</span>
            </div>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>
        {isExpanded && (
          <div className="mt-1 p-3 bg-slate-900 border border-slate-700 rounded-lg space-y-2">
            {history.toolsExecuted.map((tool, idx) => {
              const Icon = getToolIcon(tool.name)
              return (
                <div key={idx} className="flex items-start gap-3 p-2 bg-slate-800 rounded">
                  <Icon size={16} className="text-blue-400 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-300 font-medium">
                      {getToolLabel(tool.name)}
                    </div>
                    {tool.result && (
                      <div className="text-xs text-slate-500 mt-1 truncate">{tool.result}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Variant 5: Stacked Icons with Counter
  if (variant === 'stacked') {
    return (
      <div className="mt-2 flex items-center gap-2">
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
        <span className="text-xs text-slate-500">
          {toolsCount} action(s) exécutée(s)
        </span>
      </div>
    )
  }

  // Variant 6: Progress Bar Style
  if (variant === 'progress') {
    return (
      <div className="mt-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-400">Actions IA</span>
          <span className="text-xs text-blue-400">{toolsCount} exécutée(s)</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" />
        </div>
        {isExpanded && (
          <div className="mt-2 space-y-1">
            {history.toolsExecuted.map((tool, idx) => (
              <div key={idx} className="text-xs text-slate-500 flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-blue-400" />
                {getToolLabel(tool.name)}
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-1 text-xs text-blue-400 hover:text-blue-300"
        >
          {isExpanded ? 'Masquer' : 'Voir détails'}
        </button>
      </div>
    )
  }

  // Variant 7: Compact List
  if (variant === 'compact') {
    return (
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Sparkles size={12} className="text-blue-400" />
        {history.toolsExecuted.map((tool, idx) => {
          const Icon = getToolIcon(tool.name)
          return (
            <div
              key={idx}
              className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-800 rounded text-xs text-slate-400"
            >
              <Icon size={10} />
              {getToolLabel(tool.name)}
            </div>
          )
        })}
      </div>
    )
  }

  // Variant 8: Sidebar Style (inline mini version)
  if (variant === 'sidebar') {
    return (
      <div className="mt-2 flex gap-2">
        <div className="w-1 bg-blue-500 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles size={12} />
            <span>Actions exécutées</span>
          </div>
          {history.toolsExecuted.map((tool, idx) => {
            const Icon = getToolIcon(tool.name)
            return (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-500">
                <Icon size={12} className="text-blue-400" />
                <span>{getToolLabel(tool.name)}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Variant 9: Modal Preview (just the trigger)
  if (variant === 'modal') {
    return (
      <div className="mt-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-md text-sm text-blue-400 transition-colors flex items-center gap-2"
        >
          <Sparkles size={14} />
          Voir les {toolsCount} action(s)
        </button>
        {isExpanded && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-slate-200">Actions IA</h3>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-slate-500 hover:text-slate-300"
                >
                  ×
                </button>
              </div>
              <div className="space-y-3">
                {history.toolsExecuted.map((tool, idx) => {
                  const Icon = getToolIcon(tool.name)
                  return (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-slate-800 rounded">
                      <Icon size={18} className="text-blue-400 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm text-slate-300 font-medium">
                          {getToolLabel(tool.name)}
                        </div>
                        {tool.result && (
                          <div className="text-xs text-slate-500 mt-1">{tool.result}</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Variant 10: Chips/Tags
  if (variant === 'chips') {
    return (
      <div className="mt-2">
        <div className="text-xs text-slate-400 mb-1.5 flex items-center gap-1">
          <Sparkles size={11} />
          Actions IA
        </div>
        <div className="flex flex-wrap gap-1.5">
          {history.toolsExecuted.map((tool, idx) => {
            const Icon = getToolIcon(tool.name)
            return (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-xs text-blue-400"
              >
                <Icon size={11} />
                {getToolLabel(tool.name)}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return null
}
