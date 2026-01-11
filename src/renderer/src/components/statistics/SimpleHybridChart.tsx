import { useState, useMemo } from 'react';

import { useTheme } from '../../lib/theme-context';
import type { Transcription } from '../../lib/history';

interface SimpleHybridChartProps {
  transcriptions: Transcription[];
}

interface HourlyCell {
  dateKey: string;
  dayLabel: string;
  hour: number;
  count: number;
  transcriptions: Transcription[];
}

const SimpleHybridChart = ({ transcriptions }: SimpleHybridChartProps) => {
  const { theme } = useTheme();
  const { colors, spacing, typography, borderRadius } = theme;
  const [selectedCell, setSelectedCell] = useState<HourlyCell | null>(null);
  const [hoveredCell, setHoveredCell] = useState<HourlyCell | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Aggregate by hour with transcriptions
  const hourlyData = useMemo(() => {
    const dataMap = new Map<string, Transcription[]>();

    transcriptions.forEach(t => {
      const date = new Date(t.timestamp);
      const hourKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${String(date.getHours()).padStart(2, '0')}`;
      const existing = dataMap.get(hourKey) || [];
      existing.push(t);
      dataMap.set(hourKey, existing);
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
        const cellTranscriptions = hourlyData.get(dateKey) || [];

        result.push({
          dateKey,
          dayLabel,
          hour: h,
          count: cellTranscriptions.length,
          transcriptions: cellTranscriptions
        });
      }
    }

    return result;
  }, [hourlyData]);

  const maxCount = Math.max(...cells.map(c => c.count), 1);

  const getCellColor = (count: number, isSelected: boolean) => {
    if (isSelected) return colors.accent.blue.primary;
    if (count === 0) return colors.background.tertiary;
    const intensity = count / maxCount;
    return `rgba(14, 165, 233, ${0.2 + intensity * 0.8})`;
  };

  const cellSize = 14;
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
          WebkitAppRegion: 'no-drag',
          display: 'flex',
          gap: spacing['2xl']
        } as React.CSSProperties
      }
    >
      {/* Left: Heatmap */}
      <div style={{ flex: 1 }}>
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
                  const isSelected = selectedCell?.dateKey === cell.dateKey;
                  return (
                    <div
                      key={hourIdx}
                      onClick={() => cell.count > 0 && setSelectedCell(cell)}
                      onMouseEnter={e => {
                        setHoveredCell(cell);
                        setMousePosition({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseMove={e =>
                        setMousePosition({ x: e.clientX, y: e.clientY })
                      }
                      onMouseLeave={() => setHoveredCell(null)}
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
                backgroundColor:
                  intensity === 0
                    ? colors.background.tertiary
                    : `rgba(14, 165, 233, ${0.2 + intensity * 0.8})`,
                borderRadius: borderRadius.xs,
                border: `1px solid ${colors.border.primary}`
              }}
            />
          ))}
          <span>Plus</span>
        </div>
      </div>

      {/* Right: Details */}
      {selectedCell && selectedCell.count > 0 && (
        <div
          style={{
            width: '350px',
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
              Détails
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
            {selectedCell.dayLabel} à{' '}
            {String(selectedCell.hour).padStart(2, '0')}h
          </div>

          <div
            style={{
              marginBottom: spacing.lg,
              padding: spacing.md,
              backgroundColor: colors.background.primary,
              borderRadius: borderRadius.md
            }}
          >
            <div
              style={{
                fontSize: typography.fontSize.lg,
                color: colors.accent.blue.primary,
                fontWeight: typography.fontWeight.bold
              }}
            >
              {selectedCell.count} transcriptions
            </div>
          </div>

          <div
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.secondary,
              marginBottom: spacing.sm,
              fontWeight: typography.fontWeight.medium
            }}
          >
            Liste ({selectedCell.transcriptions.length})
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing.xs
            }}
          >
            {selectedCell.transcriptions.map(t => {
              const date = new Date(t.timestamp);
              return (
                <div
                  key={t.id}
                  style={{
                    padding: spacing.sm,
                    backgroundColor: colors.background.primary,
                    borderRadius: borderRadius.sm,
                    fontSize: typography.fontSize.xs
                  }}
                >
                  <div
                    style={{
                      color: colors.text.secondary,
                      marginBottom: spacing.xs
                    }}
                  >
                    {date.getHours()}:
                    {String(date.getMinutes()).padStart(2, '0')}
                  </div>
                  <div
                    style={{
                      color: colors.text.tertiary,
                      fontSize: typography.fontSize.xs
                    }}
                  >
                    {t.durationMs
                      ? `${(t.durationMs / 1000).toFixed(1)}s`
                      : 'N/A'}
                  </div>
                </div>
              );
            })}
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
            {hoveredCell.dayLabel} à {String(hoveredCell.hour).padStart(2, '0')}
            h
          </div>
          <div
            style={{
              fontSize: typography.fontSize.base,
              color: colors.text.primary,
              fontWeight: typography.fontWeight.semibold
            }}
          >
            {hoveredCell.count} transcriptions
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

export default SimpleHybridChart;
