import { useState } from 'react';

import { borderRadius, colors, spacing, typography } from '../../lib/design-system';
import { formatDuration } from '../../lib/statistics';
import type { UsageData } from '../../lib/statistics';

interface HybridHeatmapChartProps {
  dailyUsage: UsageData[];
}

interface HeatmapCell {
  date: string;
  hour: number;
  count: number;
  minutes: number;
  cost: number;
  rawData: UsageData[];
}

const HybridHeatmapChart = ({ dailyUsage }: HybridHeatmapChartProps) => {
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  if (dailyUsage.length === 0) return null;

  // Aggregate usage data by hour and keep raw data
  const hourlyAggregated = new Map<string, { count: number; minutes: number; cost: number; rawData: UsageData[] }>();

  dailyUsage.forEach(usage => {
    // Parse the date string format "12 Jan 14:30"
    const dateMatch = usage.date.match(/(\d{1,2})\s+(\w+)\s+(\d{1,2}):(\d{2})/);
    if (!dateMatch) return;

    const [, day, month, hour] = dateMatch;
    const monthNum = ['jan', 'fév', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc']
      .findIndex(m => month.toLowerCase().startsWith(m));

    if (monthNum === -1) return;

    const year = new Date().getFullYear();
    const dateKey = `${year}-${String(monthNum + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}-${String(hour).padStart(2, '0')}`;

    const existing = hourlyAggregated.get(dateKey) || { count: 0, minutes: 0, cost: 0, rawData: [] };
    existing.count += usage.count;
    existing.minutes += usage.minutes;
    existing.cost += usage.cost;
    existing.rawData.push(usage);
    hourlyAggregated.set(dateKey, existing);
  });

  // Calculate grid (last 30 days for better visibility)
  const days = 30;
  const hours = 24;
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - days + 1);
  startDate.setHours(0, 0, 0, 0);

  // Generate all cells
  const cells: HeatmapCell[] = [];
  const currentDate = new Date(startDate);

  for (let d = 0; d < days; d++) {
    for (let h = 0; h < hours; h++) {
      const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}-${String(h).padStart(2, '0')}`;
      const dateStr = currentDate.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit'
      });

      const usage = hourlyAggregated.get(dateKey) || { count: 0, minutes: 0, cost: 0, rawData: [] };

      cells.push({
        date: dateStr,
        hour: h,
        count: usage.count,
        minutes: usage.minutes,
        cost: usage.cost,
        rawData: usage.rawData
      });
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Calculate max value for color intensity
  const maxCount = Math.max(...cells.map(c => c.count), 1);

  // Get color intensity based on count
  const getCellColor = (count: number, isSelected: boolean) => {
    if (isSelected) return colors.accent.blue.primary;
    if (count === 0) return colors.background.tertiary;
    const intensity = count / maxCount;
    return `rgba(14, 165, 233, ${0.2 + intensity * 0.8})`;
  };

  const cellSize = 14;
  const cellGap = 2;

  const handleCellClick = (cell: HeatmapCell) => {
    if (cell.count > 0) {
      setSelectedCell(cell);
    }
  };

  const handleMouseEnter = (cell: HeatmapCell, e: React.MouseEvent) => {
    setHoveredCell(cell);
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
  };

  // Group cells by day for rendering
  const cellsByDay = new Map<number, HeatmapCell[]>();
  for (let i = 0; i < cells.length; i++) {
    const dayIndex = Math.floor(i / hours);
    if (!cellsByDay.has(dayIndex)) {
      cellsByDay.set(dayIndex, []);
    }
    cellsByDay.get(dayIndex)!.push(cells[i]);
  }

  return (
    <div
      style={
        {
          padding: spacing['2xl'],
          WebkitAppRegion: 'no-drag',
          position: 'relative',
          display: 'flex',
          gap: spacing['2xl']
        } as React.CSSProperties
      }
    >
      {/* Left side: Heatmap */}
      <div style={{ flex: selectedCell ? 1 : 1 }}>
        <h3
          style={{
            fontSize: typography.fontSize.lg,
            color: colors.text.primary,
            marginBottom: spacing.md,
            fontWeight: typography.fontWeight.semibold
          }}
        >
          Vue d'ensemble horaire
        </h3>
        <p
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.tertiary,
            marginBottom: spacing.lg
          }}
        >
          Cliquez sur une cellule pour voir les détails minute par minute
        </p>

        <div
          style={{
            display: 'flex',
            gap: spacing.md,
            overflowX: 'auto',
            paddingBottom: spacing.lg
          }}
        >
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
            {Array.from({ length: hours }).map((_, h) => (
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

          {/* Heatmap grid */}
          <div
            style={{
              display: 'flex',
              gap: `${cellGap}px`
            }}
          >
            {Array.from(cellsByDay.entries()).map(([dayIndex, dayCells]) => (
              <div
                key={dayIndex}
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
                    justifyContent: 'center',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {dayIndex % 5 === 0 ? dayCells[0].date : ''}
                </div>
                {/* Hours of the day */}
                {dayCells.map((cell, hourIdx) => {
                  const isSelected = selectedCell?.date === cell.date && selectedCell?.hour === cell.hour;
                  return (
                    <div
                      key={`${dayIndex}-${hourIdx}`}
                      onClick={() => handleCellClick(cell)}
                      onMouseEnter={(e) => handleMouseEnter(cell, e)}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                      style={{
                        width: `${cellSize}px`,
                        height: `${cellSize}px`,
                        backgroundColor: getCellColor(cell.count, isSelected),
                        borderRadius: borderRadius.xs,
                        cursor: cell.count > 0 ? 'pointer' : 'default',
                        transition: 'all 0.2s',
                        border: isSelected
                          ? `2px solid ${colors.accent.blue.light}`
                          : `1px solid ${colors.border.primary}`,
                        transform: isSelected ? 'scale(1.1)' : 'scale(1)'
                      }}
                      title={`${cell.date} ${String(cell.hour).padStart(2, '0')}h: ${cell.count} requêtes`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.sm,
            marginTop: spacing.lg,
            fontSize: typography.fontSize.xs,
            color: colors.text.tertiary
          }}
        >
          <span>Moins</span>
          {[0, 0.25, 0.5, 0.75, 1].map((intensity, idx) => (
            <div
              key={idx}
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                backgroundColor: intensity === 0 ? colors.background.tertiary : `rgba(14, 165, 233, ${0.2 + intensity * 0.8})`,
                borderRadius: borderRadius.xs,
                border: `1px solid ${colors.border.primary}`
              }}
            />
          ))}
          <span>Plus</span>
        </div>
      </div>

      {/* Right side: Details panel */}
      {selectedCell && selectedCell.count > 0 && (
        <div
          style={{
            width: '400px',
            backgroundColor: colors.background.secondary,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            border: `1px solid ${colors.border.primary}`,
            maxHeight: '600px',
            overflowY: 'auto',
            flexShrink: 0
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing.lg
            }}
          >
            <h4
              style={{
                fontSize: typography.fontSize.base,
                color: colors.text.primary,
                fontWeight: typography.fontWeight.semibold,
                margin: 0
              }}
            >
              Détails minute par minute
            </h4>
            <button
              onClick={() => setSelectedCell(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: colors.text.tertiary,
                cursor: 'pointer',
                fontSize: typography.fontSize.lg,
                padding: 0
              }}
            >
              ×
            </button>
          </div>

          <div
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.tertiary,
              marginBottom: spacing.md
            }}
          >
            {selectedCell.date} à {String(selectedCell.hour).padStart(2, '0')}h
          </div>

          <div
            style={{
              display: 'flex',
              gap: spacing.lg,
              marginBottom: spacing.lg,
              padding: spacing.md,
              backgroundColor: colors.background.primary,
              borderRadius: borderRadius.md
            }}
          >
            <div>
              <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary }}>Requêtes</div>
              <div style={{ fontSize: typography.fontSize.lg, color: colors.accent.blue.primary, fontWeight: typography.fontWeight.bold }}>
                {selectedCell.count}
              </div>
            </div>
            <div>
              <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary }}>Durée</div>
              <div style={{ fontSize: typography.fontSize.base, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>
                {formatDuration(selectedCell.minutes)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary }}>Coût</div>
              <div style={{ fontSize: typography.fontSize.base, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>
                ${selectedCell.cost.toFixed(4)}
              </div>
            </div>
          </div>

          <div style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, marginBottom: spacing.sm, fontWeight: typography.fontWeight.medium }}>
            Événements ({selectedCell.rawData.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
            {selectedCell.rawData.map((data, idx) => (
              <div
                key={idx}
                style={{
                  padding: spacing.sm,
                  backgroundColor: colors.background.primary,
                  borderRadius: borderRadius.sm,
                  fontSize: typography.fontSize.xs,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ color: colors.text.secondary }}>{data.date}</span>
                <div style={{ display: 'flex', gap: spacing.md, color: colors.text.tertiary }}>
                  <span>{data.count} req</span>
                  <span>{formatDuration(data.minutes)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tooltip */}
      {hoveredCell && !selectedCell && (
        <div
          style={{
            position: 'fixed',
            left: `${mousePosition.x + 10}px`,
            top: `${mousePosition.y + 10}px`,
            backgroundColor: colors.background.primary,
            border: `1px solid ${colors.border.primary}`,
            borderRadius: borderRadius.md,
            padding: spacing.md,
            zIndex: 1000,
            pointerEvents: 'none',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.tertiary,
              marginBottom: spacing.xs
            }}
          >
            {hoveredCell.date} à {String(hoveredCell.hour).padStart(2, '0')}h
          </div>
          <div
            style={{
              fontSize: typography.fontSize.base,
              color: colors.text.primary,
              fontWeight: typography.fontWeight.semibold
            }}
          >
            {hoveredCell.count} requêtes
          </div>
          {hoveredCell.count > 0 && (
            <div
              style={{
                fontSize: typography.fontSize.xs,
                color: colors.accent.blue.primary,
                marginTop: spacing.xs
              }}
            >
              Cliquez pour voir les détails
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HybridHeatmapChart;
