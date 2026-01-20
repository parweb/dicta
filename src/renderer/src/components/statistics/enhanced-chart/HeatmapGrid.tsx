import { useThemeStore } from '@/hooks/useThemeStore'

export interface HourlyCell {
  dateKey: string
  dayLabel: string
  hour: number
  count: number
  transcriptions: any[]
}

interface HeatmapGridProps {
  cells: HourlyCell[]
  maxCount: number
  hoveredCell: HourlyCell | null
  onCellClick: (cell: HourlyCell) => void
  onCellHover: (cell: HourlyCell | null, event?: React.MouseEvent) => void
  onMouseMove: (event: React.MouseEvent) => void
}

export default function HeatmapGrid({
  cells,
  maxCount,
  hoveredCell,
  onCellClick,
  onCellHover,
  onMouseMove
}: HeatmapGridProps) {
  const { theme } = useThemeStore()
  const { colors, spacing, typography, borderRadius } = theme

  const getCellColor = (count: number, isHovered: boolean) => {
    if (count === 0) return colors.background.tertiary
    const intensity = count / maxCount
    const baseIntensity = 0.2 + intensity * 0.8
    if (isHovered) {
      return `rgba(14, 165, 233, ${Math.min(baseIntensity + 0.15, 1)})`
    }
    return `rgba(14, 165, 233, ${baseIntensity})`
  }

  const cellSize = 14
  const cellGap = 2

  // Group by day
  const cellsByDay: HourlyCell[][] = []
  for (let i = 0; i < cells.length; i += 24) {
    cellsByDay.push(cells.slice(i, i + 24))
  }

  return (
    <div style={{ display: 'flex', gap: spacing.md, justifyContent: 'center' }}>
      {/* Hour labels */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: `${cellGap}px`,
          paddingTop: '16px',
          flexShrink: 0
        }}
      >
        {Array.from({ length: 24 }).map((_, h) => (
          <div
            key={h}
            style={{
              height: `${cellSize}px`,
              fontSize: typography.fontSize.xs,
              color: colors.text.tertiary,
              display: 'flex',
              alignItems: 'center',
              paddingRight: spacing.sm,
              minWidth: '30px',
              justifyContent: 'flex-end'
            }}
          >
            {h % 6 === 0 ? `${h}h` : ''}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'flex', gap: `${cellGap}px` }}>
        {cellsByDay.map((dayCells, dayIdx) => (
          <div
            key={dayIdx}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: `${cellGap}px`
            }}
          >
            {/* Day label */}
            <div
              style={{
                height: '14px',
                fontSize: typography.fontSize.xs,
                color: colors.text.tertiary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {dayIdx % 5 === 0 ? dayCells[0].dayLabel : ''}
            </div>
            {/* Hours */}
            {dayCells.map((cell, hourIdx) => {
              const isHovered = hoveredCell?.dateKey === cell.dateKey
              return (
                <div
                  key={hourIdx}
                  onClick={() => cell.count > 0 && onCellClick(cell)}
                  onMouseEnter={(e) => {
                    if (cell.count > 0) {
                      onCellHover(cell, e)
                    }
                  }}
                  onMouseMove={onMouseMove}
                  onMouseLeave={() => onCellHover(null)}
                  style={{
                    width: `${cellSize}px`,
                    height: `${cellSize}px`,
                    backgroundColor: getCellColor(cell.count, isHovered),
                    borderRadius: borderRadius.xs,
                    cursor: cell.count > 0 ? 'pointer' : 'default',
                    border:
                      cell.count > 0
                        ? `1px solid ${isHovered ? 'rgba(14, 165, 233, 0.3)' : colors.border.primary}`
                        : 'none',
                    transform: isHovered ? 'scale(1.2)' : 'scale(1)',
                    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxShadow: isHovered
                      ? '0 2px 12px rgba(14, 165, 233, 0.4), 0 0 0 2px rgba(14, 165, 233, 0.2)'
                      : 'none',
                    zIndex: isHovered ? 100 : 1
                  }}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
