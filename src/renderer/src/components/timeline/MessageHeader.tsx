/**
 * Message Header Component
 * Displays timestamp and action buttons
 */

import { memo } from 'react'
import { useThemeStore } from '@/hooks/useThemeStore'
import MessageTimestamp from './MessageTimestamp'
import MessageActions from './MessageActions'

interface MessageHeaderProps {
  timestamp: number
  onCopy?: () => void
  onOpenActions?: () => void
}

const MessageHeader = memo(function MessageHeader({
  timestamp,
  onCopy,
  onOpenActions
}: MessageHeaderProps) {
  const { theme } = useThemeStore()
  const { spacing } = theme

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm
      }}
    >
      <MessageTimestamp timestamp={timestamp} />
      <MessageActions onCopy={onCopy} onOpenActions={onOpenActions} />
    </div>
  )
})

export default MessageHeader
