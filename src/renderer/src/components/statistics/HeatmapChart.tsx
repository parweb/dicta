import { useState } from 'react';

import { borderRadius, colors, spacing, typography } from '../../lib/design-system';
import type { UsageData } from '../../lib/statistics';

interface HeatmapChartProps {
  dailyUsage: UsageData[];
}

interface HeatmapCell {
  date: string;
  count: number;
  minutes: number;
  cost: number;
  dayOfWeek: number; // 0 = Monday, 1 = Tuesday, etc.
}

const HeatmapChart = ({ dailyUsage }: HeatmapChartProps) => {
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  if (dailyUsage.length === 0) return null;

  // Aggregate usage data by day (dailyUsage is per minute, we need per day)
  const dailyAggregated = new Map<string, { count: number; minutes: number; cost: number }>();

  dailyUsage.forEach(usage => {
    // Parse the date string format "12 Jan 14:30" to extract day
    const dateMatch = usage.date.match(/(\d{1,2})\s+(\w+)/);
    if (!dateMatch) return;

    const [, day, month] = dateMatch;
    const monthNum = ['jan', 'fév', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc']
      .findIndex(m => month.toLowerCase().startsWith(m));

    if (monthNum === -1) return;

    const year = new Date().getFullYear();
    const dateKey = `${year}-${String(monthNum + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const existing = dailyAggregated.get(dateKey) || { count: 0, minutes: 0, cost: 0 };
    existing.count += usage.count;
    existing.minutes += usage.minutes;
    existing.cost += usage.cost;
    dailyAggregated.set(dateKey, existing);
  });

  // Calculate heatmap grid (last 12 weeks)
  const weeks = 12;
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - weeks * 7 + 1);

  // Start from the first Monday
  const dayOfWeek = startDate.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startDate.setDate(startDate.getDate() + diff);

  // Generate all cells
  const cells: HeatmapCell[] = [];
  const currentDate = new Date(startDate);

  for (let i = 0; i < weeks * 7; i++) {
    const dateKey = currentDate.toISOString().split('T')[0];
    const dateStr = currentDate.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit'
    });

    const usage = dailyAggregated.get(dateKey) || { count: 0, minutes: 0, cost: 0 };

    cells.push({
      date: dateStr,
      count: usage.count,
      minutes: usage.minutes,
      cost: usage.cost,
      dayOfWeek: (currentDate.getDay() + 6) % 7 // Convert to Monday = 0
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Calculate max value for color intensity
  const maxCount = Math.max(...cells.map(c => c.count), 1);

  // Get color intensity based on count
  const getCellColor = (count: number) => {
    if (count === 0) return colors.background.tertiary;
    const intensity = count / maxCount;
    return `rgba(${intensity > 0.75 ? '14, 165, 233' : intensity > 0.5 ? '14, 165, 233' : intensity > 0.25 ? '14, 165, 233' : '14, 165, 233'}, ${0.2 + intensity * 0.8})`;
  };

  const dayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const cellSize = 12;
  const cellGap = 3;

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

  return (
    <div
      style={
        {
          padding: spacing['2xl'],
          WebkitAppRegion: 'no-drag',
          position: 'relative'
        } as React.CSSProperties
      }
    >
      <div
        style={{
          display: 'flex',
          gap: spacing.md
        }}
      >
        {/* Day labels */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: `${cellGap}px`,
            paddingTop: '20px'
          }}
        >
          {dayLabels.map((label) => (
            <div
              key={label}
              style={{
                height: `${cellSize}px`,
                fontSize: typography.fontSize.xs,
                color: colors.text.tertiary,
                display: 'flex',
                alignItems: 'center',
                paddingRight: spacing.sm
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div
          style={{
            display: 'flex',
            gap: `${cellGap}px`,
            overflow: 'auto'
          }}
        >
          {Array.from({ length: weeks }).map((_, weekIdx) => (
            <div
              key={weekIdx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: `${cellGap}px`
              }}
            >
              {/* Week label (only show first day of month) */}
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
                {cells[weekIdx * 7]?.date.split('/')[1] !== cells[Math.max(0, weekIdx * 7 - 7)]?.date.split('/')[1]
                  ? cells[weekIdx * 7]?.date.split('/')[1]
                  : ''}
              </div>
              {/* Days of the week */}
              {Array.from({ length: 7 }).map((_, dayIdx) => {
                const cell = cells[weekIdx * 7 + dayIdx];
                if (!cell) return null;

                return (
                  <div
                    key={`${weekIdx}-${dayIdx}`}
                    onMouseEnter={(e) => handleMouseEnter(cell, e)}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      width: `${cellSize}px`,
                      height: `${cellSize}px`,
                      backgroundColor: getCellColor(cell.count),
                      borderRadius: borderRadius.xs,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      border: `1px solid ${colors.border.primary}`
                    }}
                    title={`${cell.date}: ${cell.count} requêtes`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredCell && (
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
            {hoveredCell.date}
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
          {hoveredCell.minutes > 0 && (
            <div
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
                marginTop: spacing.xs
              }}
            >
              {hoveredCell.minutes.toFixed(1)} min • ${hoveredCell.cost.toFixed(4)}
            </div>
          )}
        </div>
      )}

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
  );
};

export default HeatmapChart;
