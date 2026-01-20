import { useTheme } from '@/lib/theme-context'
import type { HourlyCell } from '../enhanced-chart/HeatmapGrid'

interface SimpleHeatmapGridProps {
  cells: HourlyCell[]
  maxCount: number
  selectedCell: HourlyCell | null
  onCellClick: (cell: HourlyCell) => void
  onCellHover: (cell: HourlyCell | null, event?: React.MouseEvent) => void
  onMouseMove: (event: React.MouseEvent) => void
}

export default function SimpleHeatmapGrid({
  cells,
  maxCount,
  selectedCell,
  onCellClick,
  onCellHover,
  onMouseMove
}: SimpleHeatmapGridProps) {
  const { theme } = useTheme()
  const { colors, spacing, typography, borderRadius } = theme

  const getCellColor = (count: number, isSelected: boolean) => {
    if (isSelected) return colors.accent.blue.primary
    if (count === 0) return colors.background.tertiary
    const intensity = count / maxCount
    return `rgba(14, 165, 233, ${0.2 + intensity * 0.8})`
  }

  const cellSize = 14
  const cellGap = 2

  // Group by day
  const cellsByDay: HourlyCell[][] = []
  for (let i = 0; i < cells.length; i += 24) {
    cellsByDay.push(cells.slice(i, i + 24))
  }

  return (
    <div>
      <h3
        style={{
          fontSize: typography.fontSize.lg,
          color: colors.text.primary,
          marginBottom: spacing.md,
          fontWeight: typography.fontWeight.semibold
        }}
      >
        Vue hybride - Cliquez sur une cellule
      </h3>

      <div style={{ display: 'flex', gap: spacing.md, overflowX: 'auto' }}>
        {/* Hour labels */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: `${cellGap}px`,
            paddingTop: '20px',
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
                minWidth: '30px'
              }}
            >
              {h % 4 === 0 ? `${String(h).padStart(2, '0')}h` : ''}
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
                  height: '16px',
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
                const isSelected = selectedCell?.dateKey === cell.dateKey
                return (
                  <div
                    key={hourIdx}
                    onClick={() => cell.count > 0 && onCellClick(cell)}
                    onMouseEnter={(e) => {
                      onCellHover(cell, e)
                    }}
                    onMouseMove={onMouseMove}
                    onMouseLeave={() => onCellHover(null)}
                    style={{
                      width: `${cellSize}px`,
                      height: `${cellSize}px`,
                      backgroundColor: getCellColor(cell.count, isSelected),
                      borderRadius: borderRadius.xs,
                      cursor: cell.count > 0 ? 'pointer' : 'default',
                      border: isSelected
                        ? `2px solid ${colors.accent.blue.light}`
                        : `1px solid ${colors.border.primary}`,
                      transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.2s'
                    }}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
