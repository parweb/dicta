import { useMemo, useState } from 'react';

import { borderRadius, colors, spacing, typography } from '../../lib/design-system';
import type { Transcription } from '../../lib/history';

interface DailyTimelineGridChartProps {
  transcriptions: Transcription[];
}

interface DailyCell {
  dateKey: string;
  dayLabel: string;
  fullDate: string;
  count: number;
  transcriptions: Transcription[];
}

const DailyTimelineGridChart = ({ transcriptions }: DailyTimelineGridChartProps) => {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);

  // Aggregate by day with transcriptions
  const dailyData = useMemo(() => {
    const dataMap = new Map<string, Transcription[]>();

    transcriptions.forEach(t => {
      const date = new Date(t.timestamp);
      const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const existing = dataMap.get(dayKey) || [];
      existing.push(t);
      dataMap.set(dayKey, existing);
    });

    return dataMap;
  }, [transcriptions]);

  // Generate cells for last 30 days
  const cells = useMemo(() => {
    const result: DailyCell[] = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 29);
    startDate.setHours(0, 0, 0, 0);

    for (let d = 0; d < 30; d++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + d);

      const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      const dayLabel = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      const fullDate = currentDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
      const cellTranscriptions = dailyData.get(dateKey) || [];

      if (cellTranscriptions.length > 0) {
        result.push({
          dateKey,
          dayLabel,
          fullDate,
          count: cellTranscriptions.length,
          transcriptions: cellTranscriptions
        });
      }
    }

    return result.sort((a, b) => {
      const aDate = new Date(a.dateKey);
      const bDate = new Date(b.dateKey);
      return bDate.getTime() - aDate.getTime();
    });
  }, [dailyData]);

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
    );
  }

  return (
    <div
      style={
        {
          padding: spacing.xl,
          WebkitAppRegion: 'no-drag'
        } as React.CSSProperties
      }
    >
      {/* Vertical stack of timelines */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.xs,
          maxWidth: '1000px',
          margin: '0 auto'
        }}
      >
        {cells.map((cell) => {
          const isHovered = hoveredCell === cell.dateKey;

          return (
            <div
              key={cell.dateKey}
              onMouseEnter={() => setHoveredCell(cell.dateKey)}
              onMouseLeave={() => setHoveredCell(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.md,
                transition: 'all 0.15s ease-out'
              }}
            >
              {/* Minimal date label */}
              <div
                style={{
                  fontSize: typography.fontSize.xs,
                  color: isHovered ? colors.text.secondary : colors.text.tertiary,
                  minWidth: '50px',
                  textAlign: 'right',
                  transition: 'color 0.15s ease-out',
                  fontWeight: typography.fontWeight.medium
                }}
              >
                {cell.dayLabel}
              </div>

              {/* Timeline graph - 24 hours */}
              <div
                style={{
                  position: 'relative',
                  height: '32px',
                  flex: 1,
                  overflow: 'visible'
                }}
              >
                {/* Timeline container */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
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
                      height: '1px',
                      backgroundColor: colors.border.primary,
                      opacity: isHovered ? 0.6 : 0.3,
                      transition: 'opacity 0.15s ease-out'
                    }}
                  />

                  {/* Transcription markers */}
                  {cell.transcriptions.map((t, idx) => {
                    const date = new Date(t.timestamp);
                    const hours = date.getHours();
                    const minutes = date.getMinutes();
                    const seconds = date.getSeconds();
                    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
                    const position = (totalSeconds / 86400) * 100; // 86400 seconds in a day
                    const duration = t.durationMs || 0;
                    const maxDuration = Math.max(...cell.transcriptions.map(t => t.durationMs || 0), 1);
                    const baseSize = 6;
                    const size = Math.max(baseSize, (duration / maxDuration) * 10 + baseSize);
                    const isMarkerHovered = hoveredMarker === t.id;
                    const timeLabel = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

                    return (
                      <div
                        key={t.id}
                        style={{
                          position: 'absolute',
                          left: `${position}%`,
                          top: '50%',
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        <div
                          onMouseEnter={() => setHoveredMarker(t.id)}
                          onMouseLeave={() => setHoveredMarker(null)}
                          style={{
                            width: `${size}px`,
                            height: `${size}px`,
                            backgroundColor: colors.accent.blue.primary,
                            borderRadius: '50%',
                            border: 'none',
                            boxShadow: isMarkerHovered ? '0 2px 12px rgba(14, 165, 233, 0.6)' : isHovered ? '0 2px 8px rgba(14, 165, 233, 0.5)' : '0 1px 4px rgba(14, 165, 233, 0.3)',
                            zIndex: cell.transcriptions.length - idx,
                            opacity: isMarkerHovered ? 1 : isHovered ? 1 : 0.8,
                            transition: 'all 0.15s ease-out',
                            animation: `markerFadeIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 0.03}s both`,
                            cursor: 'default',
                            transform: isMarkerHovered ? 'scale(1.15)' : 'scale(1)'
                          }}
                        />
                        {/* Time label on hover */}
                        {isMarkerHovered && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '-24px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              fontSize: typography.fontSize.xs,
                              color: colors.text.primary,
                              fontWeight: typography.fontWeight.medium,
                              backgroundColor: colors.background.secondary,
                              padding: `${spacing.xs} ${spacing.sm}`,
                              borderRadius: borderRadius.xs,
                              whiteSpace: 'nowrap',
                              pointerEvents: 'none',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                              animation: 'timeLabelIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                              zIndex: 1000
                            }}
                          >
                            {timeLabel}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Count indicator */}
              <div
                style={{
                  fontSize: typography.fontSize.xs,
                  color: colors.text.tertiary,
                  minWidth: '30px',
                  opacity: isHovered ? 1 : 0,
                  transition: 'opacity 0.15s ease-out',
                  fontWeight: typography.fontWeight.medium
                }}
              >
                {cell.count}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes markerFadeIn {
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
        @keyframes timeLabelIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default DailyTimelineGridChart;
