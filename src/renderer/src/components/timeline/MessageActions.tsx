/**
 * Message Actions Component
 * Action buttons for transcription message (Copy, Actions)
 */

import { memo } from 'react'
import { Copy, Sparkles } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'
import IconButton from '../ui/IconButton'

interface MessageActionsProps {
  onCopy?: () => void
  onOpenActions?: () => void
}

const MessageActions = memo(function MessageActions({
  onCopy,
  onOpenActions
}: MessageActionsProps) {
  const { theme } = useTheme()
  const { spacing, colors } = theme

  return (
    <div style={{ display: 'flex', gap: spacing.xs }}>
      {onCopy && (
        <IconButton icon={<Copy size={14} />} onClick={onCopy} />
      )}
      {onOpenActions && (
        <IconButton
          icon={<Sparkles size={14} />}
          label="Actions"
          onClick={onOpenActions}
          color={colors.accent.blue.primary}
        />
      )}
    </div>
  )
})

export default MessageActions
