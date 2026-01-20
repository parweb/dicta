/**
 * Message Timestamp Component
 * Displays formatted timestamp with relative time for recent items
 */

import { memo, useMemo } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useTheme } from '@/lib/theme-context'

interface MessageTimestampProps {
  timestamp: number
}

const MessageTimestamp = memo(function MessageTimestamp({ timestamp }: MessageTimestampProps) {
  const { theme } = useTheme()
  const { colors, typography } = theme

  const formattedTime = useMemo(() => {
    const date = new Date(timestamp)
    const now = Date.now()
    const age = now - timestamp
    const oneDay = 24 * 60 * 60 * 1000

    // If less than 24 hours ago, show relative time
    if (age < oneDay) {
      return formatDistanceToNow(date, { addSuffix: true, locale: fr })
    }

    // Otherwise show full date + time
    return format(date, 'dd MMM yyyy à HH:mm', { locale: fr })
  }, [timestamp])

  return (
    <span
      style={{
        fontSize: typography.fontSize.xs,
        color: colors.text.tertiary
      }}
    >
      {formattedTime}
    </span>
  )
})

export default MessageTimestamp
