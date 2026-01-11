import { useState, useMemo } from 'react';

import { borderRadius, colors, spacing, typography } from '../../lib/design-system';
import type { Transcription } from '../../lib/history';

interface SimpleHourlyChartProps {
  transcriptions: Transcription[];
}

interface HourlyCell {
  dateKey: string;
  dayLabel: string;
  hour: number;
  count: number;
}

const SimpleHourlyChart = ({ transcriptions }: SimpleHourlyChartProps) => {
  const [hoveredCell, setHoveredCell] = useState<HourlyCell | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Aggregate by hour
  const hourlyData = useMemo(() => {
    const dataMap = new Map<string, number>();

    transcriptions.forEach(t => {
      const date = new Date(t.timestamp);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${String(date.getHours()).padStart(2, '0')}`;
      dataMap.set(dateKey, (dataMap.get(dateKey) || 0) + 1);
    });

    return dataMap;
  }, [transcriptions]);

  // Generate grid (last 30 days)
  const cells = useMemo(() => {
    const result: HourlyCell[] = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 29);
    startDate.setHours(0, 0, 0, 0);

    for (let d = 0; d < 30; d++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + d);

      for (let h = 0; h < 24; h++) {
        const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}-${String(h).padStart(2, '0')}`;
        const dayLabel = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        const count = hourlyData.get(dateKey) || 0;

        result.push({ dateKey, dayLabel, hour: h, count });
      }
    }

    return result;
  }, [hourlyData]);

  const maxCount = Math.max(...cells.map(c => c.count), 1);

  const getCellColor = (count: number) => {
    if (count === 0) return colors.background.tertiary;
    const intensity = count / maxCount;
    return `rgba(14, 165, 233, ${0.2 + intensity * 0.8})`;
  };

  const cellSize = 12;
  const cellGap = 2;

  // Group by day
  const cellsByDay: HourlyCell[][] = [];
  for (let i = 0; i < cells.length; i += 24) {
    cellsByDay.push(cells.slice(i, i + 24));
  }

  return (
    <div
      style={
        {
          padding: spacing['2xl'],
          WebkitAppRegion: 'no-drag'
        } as React.CSSProperties
      }
    >
      <h3
        style={{
          fontSize: typography.fontSize.lg,
          color: colors.text.primary,
          marginBottom: spacing.lg,
          fontWeight: typography.fontWeight.semibold
        }}
      >
        Activité horaire (30 derniers jours)
      </h3>

      <div style={{ display: 'flex', gap: spacing.md, overflowX: 'auto' }}>
        {/* Hour labels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${cellGap}px`, paddingTop: '20px', flexShrink: 0 }}>
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
            <div key={dayIdx} style={{ display: 'flex', flexDirection: 'column', gap: `${cellGap}px` }}>
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
              {dayCells.map((cell, hourIdx) => (
                <div
                  key={hourIdx}
                  onMouseEnter={(e) => {
                    setHoveredCell(cell);
                    setMousePosition({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseMove={(e) => setMousePosition({ x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => setHoveredCell(null)}
                  style={{
                    width: `${cellSize}px`,
                    height: `${cellSize}px`,
                    backgroundColor: getCellColor(cell.count),
                    borderRadius: borderRadius.xs,
                    cursor: 'pointer',
                    border: `1px solid ${colors.border.primary}`
                  }}
                />
              ))}
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
          <div style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary, marginBottom: spacing.xs }}>
            {hoveredCell.dayLabel} à {String(hoveredCell.hour).padStart(2, '0')}h
          </div>
          <div style={{ fontSize: typography.fontSize.base, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>
            {hoveredCell.count} transcriptions
          </div>
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

export default SimpleHourlyChart;
