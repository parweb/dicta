import { useState, useMemo } from 'react';

import { useTheme } from '../../lib/theme-context';
import type { Transcription } from '../../lib/history';

interface EnhancedHybridChartProps {
  transcriptions: Transcription[];
}

interface HourlyCell {
  dateKey: string;
  dayLabel: string;
  hour: number;
  count: number;
  transcriptions: Transcription[];
}

const EnhancedHybridChart = ({ transcriptions }: EnhancedHybridChartProps) => {
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

  const getCellColor = (count: number, isHovered: boolean) => {
    if (count === 0) return colors.background.tertiary;
    const intensity = count / maxCount;
    const baseIntensity = 0.2 + intensity * 0.8;
    if (isHovered) {
      return `rgba(14, 165, 233, ${Math.min(baseIntensity + 0.15, 1)})`;
    }
    return `rgba(14, 165, 233, ${baseIntensity})`;
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
          padding: spacing.xl,
          WebkitAppRegion: 'no-drag',
          position: 'relative'
        } as React.CSSProperties
      }
    >
      <div
        style={{ display: 'flex', gap: spacing.md, justifyContent: 'center' }}
      >
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
                const isHovered = hoveredCell?.dateKey === cell.dateKey;
                return (
                  <div
                    key={hourIdx}
                    onClick={() => cell.count > 0 && setSelectedCell(cell)}
                    onMouseEnter={e => {
                      if (cell.count > 0) {
                        setHoveredCell(cell);
                        setMousePosition({ x: e.clientX, y: e.clientY });
                      }
                    }}
                    onMouseMove={e =>
                      setMousePosition({ x: e.clientX, y: e.clientY })
                    }
                    onMouseLeave={() => setHoveredCell(null)}
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
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Hover tooltip with detailed graph */}
      {hoveredCell &&
        !selectedCell &&
        hoveredCell.count > 0 &&
        (() => {
          const avgDuration =
            hoveredCell.transcriptions.reduce(
              (sum, t) => sum + (t.durationMs || 0),
              0
            ) /
            hoveredCell.count /
            1000;
          return (
            <div
              style={{
                position: 'fixed',
                left: `${mousePosition.x + 16}px`,
                top: `${mousePosition.y + 16}px`,
                backgroundColor: 'rgba(30, 41, 59, 0.95)',
                borderRadius: borderRadius.md,
                padding: spacing.md,
                zIndex: 1000,
                pointerEvents: 'none',
                boxShadow:
                  '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                width: '260px',
                animation: 'tooltipIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                backdropFilter: 'blur(12px)'
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: spacing.md,
                  paddingBottom: spacing.sm,
                  borderBottom: `1px solid ${colors.border.primary}`
                }}
              >
                <div
                  style={{
                    fontSize: typography.fontSize.xs,
                    color: colors.text.tertiary
                  }}
                >
                  {hoveredCell.dayLabel} ·{' '}
                  {String(hoveredCell.hour).padStart(2, '0')}h
                </div>
                <div
                  style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.text.primary,
                    fontWeight: typography.fontWeight.semibold
                  }}
                >
                  {hoveredCell.count}
                </div>
              </div>

              {/* Mini timeline graph */}
              <div
                style={{
                  position: 'relative',
                  height: '50px',
                  backgroundColor: colors.background.primary,
                  borderRadius: borderRadius.sm,
                  marginBottom: spacing.sm,
                  overflow: 'hidden'
                }}
              >
                {/* Timeline container with padding */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '12px',
                    right: '12px',
                    bottom: 0
                  }}
                >
                  {/* Timeline axis */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: 0,
                      right: 0,
                      height: '2px',
                      backgroundColor: colors.border.secondary,
                      borderRadius: '1px'
                    }}
                  />

                  {/* Transcription markers */}
                  {hoveredCell.transcriptions.map((t, idx) => {
                    const date = new Date(t.timestamp);
                    const minute = date.getMinutes();
                    const seconds = date.getSeconds();
                    const totalSeconds = minute * 60 + seconds;
                    const position = (totalSeconds / 3600) * 100;
                    const duration = t.durationMs || 0;
                    const maxDuration = Math.max(
                      ...hoveredCell.transcriptions.map(t => t.durationMs || 0),
                      1
                    );
                    const size = Math.max(7, (duration / maxDuration) * 14 + 7);

                    return (
                      <div
                        key={t.id}
                        title={`${minute}:${String(seconds).padStart(2, '0')}`}
                        style={{
                          position: 'absolute',
                          left: `${position}%`,
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: `${size}px`,
                          height: `${size}px`,
                          backgroundColor: colors.accent.blue.primary,
                          borderRadius: '50%',
                          border: `2px solid ${colors.background.primary}`,
                          boxShadow: '0 2px 8px rgba(14, 165, 233, 0.4)',
                          zIndex: hoveredCell.transcriptions.length - idx,
                          animation: `markerIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 0.04}s both`
                        }}
                      />
                    );
                  })}
                </div>

                {/* Time markers */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '4px',
                    left: '12px',
                    fontSize: '9px',
                    color: colors.text.tertiary,
                    fontWeight: typography.fontWeight.medium
                  }}
                >
                  00
                </div>
                <div
                  style={{
                    position: 'absolute',
                    bottom: '4px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '9px',
                    color: colors.text.tertiary,
                    fontWeight: typography.fontWeight.medium
                  }}
                >
                  30
                </div>
                <div
                  style={{
                    position: 'absolute',
                    bottom: '4px',
                    right: '12px',
                    fontSize: '9px',
                    color: colors.text.tertiary,
                    fontWeight: typography.fontWeight.medium
                  }}
                >
                  60
                </div>
              </div>

              {/* Stats footer */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '10px',
                  color: colors.text.tertiary
                }}
              >
                <span>Durée moy.</span>
                <span
                  style={{
                    color: colors.accent.blue.primary,
                    fontWeight: typography.fontWeight.medium
                  }}
                >
                  {avgDuration.toFixed(1)}s
                </span>
              </div>
            </div>
          );
        })()}

      {/* Modal for details */}
      {selectedCell && selectedCell.count > 0 && (
        <>
          {/* Backdrop with blur */}
          <div
            onClick={() => setSelectedCell(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 2000,
              animation: 'fadeIn 0.2s ease-out'
            }}
          />

          {/* Modal content */}
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: colors.background.secondary,
              borderRadius: borderRadius.md,
              padding: spacing.xl,
              border: 'none',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '70vh',
              overflowY: 'auto',
              zIndex: 2001,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
              animation: 'scaleIn 0.2s ease-out'
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: spacing.lg
              }}
            >
              <div
                style={{
                  fontSize: typography.fontSize.base,
                  color: colors.text.secondary
                }}
              >
                {selectedCell.dayLabel} ·{' '}
                {String(selectedCell.hour).padStart(2, '0')}h ·{' '}
                {selectedCell.count}
              </div>
              <button
                onClick={() => setSelectedCell(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: colors.text.tertiary,
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: typography.fontSize.xl
                }}
              >
                ×
              </button>
            </div>

            {/* Timeline visualization */}
            <div
              style={{
                marginBottom: spacing.lg,
                padding: spacing.md,
                backgroundColor: colors.background.primary,
                borderRadius: borderRadius.sm
              }}
            >
              <div
                style={{
                  position: 'relative',
                  height: '50px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {/* Timeline axis */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    height: '2px',
                    backgroundColor: colors.border.secondary
                  }}
                />

                {/* Timeline markers */}
                {selectedCell.transcriptions.map((t, idx) => {
                  const date = new Date(t.timestamp);
                  const minute = date.getMinutes();
                  const position = (minute / 60) * 100;
                  const duration = t.durationMs || 0;
                  const maxDuration = Math.max(
                    ...selectedCell.transcriptions.map(t => t.durationMs || 0),
                    1
                  );
                  const size = Math.max(8, (duration / maxDuration) * 20 + 8);

                  return (
                    <div
                      key={t.id}
                      title={`${minute}min ${date.getSeconds()}s`}
                      style={{
                        position: 'absolute',
                        left: `${position}%`,
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: `${size}px`,
                        height: `${size}px`,
                        backgroundColor: colors.accent.blue.primary,
                        borderRadius: '50%',
                        border: `1px solid ${colors.background.primary}`,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        zIndex: selectedCell.transcriptions.length - idx
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform =
                          'translate(-50%, -50%) scale(1.2)';
                        e.currentTarget.style.zIndex = '1000';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform =
                          'translate(-50%, -50%) scale(1)';
                        e.currentTarget.style.zIndex = String(
                          selectedCell.transcriptions.length - idx
                        );
                      }}
                    />
                  );
                })}

                {/* Time labels */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-18px',
                    left: 0,
                    fontSize: typography.fontSize.xs,
                    color: colors.text.tertiary
                  }}
                >
                  0
                </div>
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-18px',
                    right: 0,
                    fontSize: typography.fontSize.xs,
                    color: colors.text.tertiary
                  }}
                >
                  60
                </div>
              </div>
            </div>

            {/* Transcriptions list */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: spacing.xs
              }}
            >
              {selectedCell.transcriptions
                .sort((a, b) => a.timestamp - b.timestamp)
                .map(t => {
                  const date = new Date(t.timestamp);
                  const preview =
                    t.text.slice(0, 60) + (t.text.length > 60 ? '...' : '');

                  return (
                    <div
                      key={t.id}
                      style={{
                        padding: spacing.sm,
                        backgroundColor: colors.background.primary,
                        borderRadius: borderRadius.sm
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: spacing.xs
                        }}
                      >
                        <span
                          style={{
                            fontSize: typography.fontSize.xs,
                            color: colors.text.tertiary
                          }}
                        >
                          {String(date.getHours()).padStart(2, '0')}:
                          {String(date.getMinutes()).padStart(2, '0')}
                        </span>
                        <span
                          style={{
                            fontSize: typography.fontSize.xs,
                            color: colors.text.tertiary
                          }}
                        >
                          {t.durationMs
                            ? `${(t.durationMs / 1000).toFixed(0)}s`
                            : '—'}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: typography.fontSize.xs,
                          color: colors.text.secondary,
                          lineHeight: typography.lineHeight.normal
                        }}
                      >
                        {preview}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <style>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
            @keyframes scaleIn {
              from {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.92);
                filter: blur(8px);
              }
              60% {
                transform: translate(-50%, -50%) scale(1.02);
              }
              to {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
                filter: blur(0px);
              }
            }
            @keyframes tooltipIn {
              from {
                opacity: 0;
                transform: translateY(-12px) scale(0.94);
                filter: blur(8px);
              }
              60% {
                transform: translateY(2px) scale(1.01);
              }
              to {
                opacity: 1;
                transform: translateY(0px) scale(1);
                filter: blur(0px);
              }
            }
            @keyframes markerIn {
              from {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0) rotate(180deg);
              }
              60% {
                transform: translate(-50%, -50%) scale(1.15) rotate(-10deg);
              }
              to {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1) rotate(0deg);
              }
            }
          `}</style>
        </>
      )}
    </div>
  );
};

export default EnhancedHybridChart;
