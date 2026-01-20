import { useMemo, useState } from 'react'
import { useTheme } from '../../lib/theme-context'
import type { Transcription } from '../../lib/history'
import GlobalStatsHeader from './daily-timeline/GlobalStatsHeader'
import TimelineRow, { type DailyCell } from './daily-timeline/TimelineRow'
import './daily-timeline/daily-timeline-styles.css'

interface DailyTimelineGridChartProps {
  transcriptions: Transcription[]
}

const DailyTimelineGridChart = ({ transcriptions }: DailyTimelineGridChartProps) => {
  const { theme } = useTheme()
  const { colors, spacing } = theme
  const [hoveredCell, setHoveredCell] = useState<string | null>(null)

  // Aggregate by day with transcriptions
  const dailyData = useMemo(() => {
    const dataMap = new Map<string, Transcription[]>()

    transcriptions.forEach((t) => {
      const date = new Date(t.timestamp)
      const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      const existing = dataMap.get(dayKey) || []
      existing.push(t)
      dataMap.set(dayKey, existing)
    })

    return dataMap
  }, [transcriptions])

  // Generate cells for last 30 days
  const cells = useMemo(() => {
    const result: DailyCell[] = []
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - 29)
    startDate.setHours(0, 0, 0, 0)

    for (let d = 0; d < 30; d++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + d)

      const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
      const dayLabel = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}`
      const fullDate = currentDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      })
      const cellTranscriptions = dailyData.get(dateKey) || []

      if (cellTranscriptions.length > 0) {
        result.push({
          dateKey,
          dayLabel,
          fullDate,
          count: cellTranscriptions.length,
          transcriptions: cellTranscriptions
        })
      }
    }

    return result.sort((a, b) => {
      const aDate = new Date(a.dateKey)
      const bDate = new Date(b.dateKey)
      return bDate.getTime() - aDate.getTime()
    })
  }, [dailyData])

  // Calculate global stats
  const totalCount = cells.reduce((sum, c) => sum + c.count, 0)
  const totalDuration = transcriptions.reduce((sum, t) => sum + (t.durationMs || 0), 0) / 1000
  const avgDuration = totalCount > 0 ? totalDuration / totalCount : 0

  if (cells.length === 0) {
    return (
      <div
        style={{
          padding: spacing['2xl'],
          textAlign: 'center',
          color: colors.text.tertiary
        }}
      >
        Aucune donnée disponible pour les 30 derniers jours
      </div>
    )
  }

  return (
    <div
      className="daily-timeline-container"
      style={{
        padding: spacing.xl,
        WebkitAppRegion: 'no-drag'
      } as React.CSSProperties}
    >
      <GlobalStatsHeader
        totalCount={totalCount}
        totalDuration={totalDuration}
        avgDuration={avgDuration}
      />

      <div
        className="timeline-stack"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.xs,
          maxWidth: '1000px',
          margin: '0 auto'
        }}
      >
        {cells.map((cell) => (
          <TimelineRow
            key={cell.dateKey}
            cell={cell}
            isHovered={hoveredCell === cell.dateKey}
            onMouseEnter={() => setHoveredCell(cell.dateKey)}
            onMouseLeave={() => setHoveredCell(null)}
          />
        ))}
      </div>
    </div>
  )
}

export default DailyTimelineGridChart
