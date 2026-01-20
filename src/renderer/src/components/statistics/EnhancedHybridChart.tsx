import { useState, useMemo } from 'react'
import { useThemeStore } from '@/hooks/useThemeStore'
import type { Transcription } from '../../lib/history'
import HeatmapGrid, { type HourlyCell } from './enhanced-chart/HeatmapGrid'
import HoverTooltip from './enhanced-chart/HoverTooltip'
import DetailModal from './enhanced-chart/DetailModal'
import './enhanced-chart/animations.css'

interface EnhancedHybridChartProps {
  transcriptions: Transcription[]
}

const EnhancedHybridChart = ({ transcriptions }: EnhancedHybridChartProps) => {
  const { theme } = useThemeStore()
  const { spacing } = theme
  const [selectedCell, setSelectedCell] = useState<HourlyCell | null>(null)
  const [hoveredCell, setHoveredCell] = useState<HourlyCell | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Aggregate by hour with transcriptions
  const hourlyData = useMemo(() => {
    const dataMap = new Map<string, Transcription[]>()

    transcriptions.forEach((t) => {
      const date = new Date(t.timestamp)
      const hourKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${String(date.getHours()).padStart(2, '0')}`
      const existing = dataMap.get(hourKey) || []
      existing.push(t)
      dataMap.set(hourKey, existing)
    })

    return dataMap
  }, [transcriptions])

  // Generate grid (last 30 days)
  const cells = useMemo(() => {
    const result: HourlyCell[] = []
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - 29)
    startDate.setHours(0, 0, 0, 0)

    for (let d = 0; d < 30; d++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + d)

      for (let h = 0; h < 24; h++) {
        const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}-${String(h).padStart(2, '0')}`
        const dayLabel = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}`
        const cellTranscriptions = hourlyData.get(dateKey) || []

        result.push({
          dateKey,
          dayLabel,
          hour: h,
          count: cellTranscriptions.length,
          transcriptions: cellTranscriptions
        })
      }
    }

    return result
  }, [hourlyData])

  const maxCount = Math.max(...cells.map((c) => c.count), 1)

  const handleCellHover = (cell: HourlyCell | null, event?: React.MouseEvent) => {
    setHoveredCell(cell)
    if (event) {
      setMousePosition({ x: event.clientX, y: event.clientY })
    }
  }

  return (
    <div
      style={{
        padding: spacing.xl,
        WebkitAppRegion: 'no-drag',
        position: 'relative'
      } as React.CSSProperties}
    >
      <HeatmapGrid
        cells={cells}
        maxCount={maxCount}
        hoveredCell={hoveredCell}
        onCellClick={setSelectedCell}
        onCellHover={handleCellHover}
        onMouseMove={(e) => setMousePosition({ x: e.clientX, y: e.clientY })}
      />

      {hoveredCell && !selectedCell && hoveredCell.count > 0 && (
        <HoverTooltip cell={hoveredCell} mousePosition={mousePosition} />
      )}

      {selectedCell && selectedCell.count > 0 && (
        <DetailModal cell={selectedCell} onClose={() => setSelectedCell(null)} />
      )}
    </div>
  )
}

export default EnhancedHybridChart;
