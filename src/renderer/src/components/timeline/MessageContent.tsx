/**
 * Message Content Component
 * Displays transcription text content
 */

import { memo } from 'react'
import { useTheme } from '@/lib/theme-context'

interface MessageContentProps {
  text: string
}

const MessageContent = memo(function MessageContent({ text }: MessageContentProps) {
  const { theme } = useTheme()
  const { colors, typography } = theme

  return (
    <p
      style={{
        fontSize: typography.fontSize.base,
        lineHeight: typography.lineHeight.relaxed,
        color: colors.text.primary,
        margin: 0,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
      }}
    >
      {text}
    </p>
  )
})

export default MessageContent
