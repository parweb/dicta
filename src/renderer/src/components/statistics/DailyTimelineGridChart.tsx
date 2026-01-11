import { useMemo, useState } from 'react';

import {
  borderRadius,
  colors,
  spacing,
  typography
} from '../../lib/design-system';
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

const DailyTimelineGridChart = ({
  transcriptions
}: DailyTimelineGridChartProps) => {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

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
      const fullDate = currentDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
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

  // Calculate global stats
  const totalCount = cells.reduce((sum, c) => sum + c.count, 0);
  const totalDuration =
    transcriptions.reduce((sum, t) => sum + (t.durationMs || 0), 0) / 1000;
  const avgDuration = totalCount > 0 ? totalDuration / totalCount : 0;

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
      className="daily-timeline-container"
      style={
        {
          padding: spacing.xl,
          WebkitAppRegion: 'no-drag'
        } as React.CSSProperties
      }
    >
      {/* Global stats header - minimal */}
      <div
        className="global-stats"
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          marginBottom: spacing.lg,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: spacing.xl,
          paddingRight: '80px',
          fontSize: typography.fontSize.xs,
          color: colors.text.tertiary,
          animation: 'statsIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both'
        }}
      >
        <div
          style={{ display: 'flex', gap: spacing.xs, alignItems: 'baseline' }}
        >
          <span style={{ opacity: 0.6 }}>Total</span>
          <span
            style={{
              color: colors.text.secondary,
              fontWeight: typography.fontWeight.medium
            }}
          >
            {totalCount}
          </span>
        </div>
        <div
          style={{ display: 'flex', gap: spacing.xs, alignItems: 'baseline' }}
        >
          <span style={{ opacity: 0.6 }}>Durée</span>
          <span
            style={{
              color: colors.text.secondary,
              fontWeight: typography.fontWeight.medium
            }}
          >
            {(totalDuration / 60).toFixed(0)}m
          </span>
        </div>
        <div
          style={{ display: 'flex', gap: spacing.xs, alignItems: 'baseline' }}
        >
          <span style={{ opacity: 0.6 }}>Moy.</span>
          <span
            style={{
              color: colors.text.secondary,
              fontWeight: typography.fontWeight.medium
            }}
          >
            {avgDuration.toFixed(1)}s
          </span>
        </div>
      </div>
      {/* Vertical stack of timelines */}
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
        {cells.map(cell => {
          const isHovered = hoveredCell === cell.dateKey;
          const cellAvgDuration =
            cell.transcriptions.reduce(
              (sum, t) => sum + (t.durationMs || 0),
              0
            ) /
            cell.count /
            1000;
          const cellTotalDuration =
            cell.transcriptions.reduce(
              (sum, t) => sum + (t.durationMs || 0),
              0
            ) / 1000;

          return (
            <div
              key={cell.dateKey}
              className="timeline-row"
              onMouseEnter={() => setHoveredCell(cell.dateKey)}
              onMouseLeave={() => setHoveredCell(null)}
              style={{
                transition: 'all 0.15s ease-out'
              }}
            >
              {/* Main timeline row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.md
                }}
              >
                {/* Minimal date label */}
                <div
                  className="date-label"
                  style={{
                    fontSize: typography.fontSize.xs,
                    color: isHovered
                      ? colors.text.secondary
                      : colors.text.tertiary,
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
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* Timeline with markers */}
                  <div
                    style={{
                      position: 'relative',
                      height: '32px',
                      width: '100%'
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
                      const totalSeconds =
                        hours * 3600 + minutes * 60 + seconds;
                      const position = (totalSeconds / 86400) * 100; // 86400 seconds in a day
                      const duration = t.durationMs || 0;
                      const maxDuration = Math.max(
                        ...cell.transcriptions.map(t => t.durationMs || 0),
                        1
                      );
                      const baseSize = 6;
                      const size = Math.max(
                        baseSize,
                        (duration / maxDuration) * 10 + baseSize
                      );

                      return (
                        <div
                          key={t.id}
                          style={{
                            position: 'absolute',
                            left: `${position}%`,
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: `${size}px`,
                            height: `${size}px`,
                            backgroundColor: colors.accent.blue.primary,
                            borderRadius: '50%',
                            border: 'none',
                            boxShadow: isHovered
                              ? '0 2px 8px rgba(14, 165, 233, 0.5)'
                              : '0 1px 4px rgba(14, 165, 233, 0.3)',
                            zIndex: cell.transcriptions.length - idx,
                            opacity: isHovered ? 1 : 0.8,
                            transition: 'all 0.15s ease-out',
                            animation: `markerFadeIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 0.03}s both`
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Hour ruler - appears on hover */}
                  {isHovered && (
                    <div
                      style={{
                        height: '10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        marginTop: spacing.xs,
                        animation:
                          'rulerIn 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                        pointerEvents: 'none'
                      }}
                    >
                      {Array.from({ length: 24 }).map((_, hour) => {
                        const isMajorTick = hour % 4 === 0 || hour === 23;
                        return (
                          <div
                            key={hour}
                            style={{
                              width: '1px',
                              height: isMajorTick ? '8px' : '4px',
                              backgroundColor: colors.text.tertiary,
                              opacity: isMajorTick ? 0.6 : 0.4,
                              transition: 'all 0.2s ease-out'
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Stats below - appears on hover */}
              <div
                className="row-stats"
                style={{
                  display: 'flex',
                  gap: spacing.md,
                  fontSize: typography.fontSize.xs,
                  color: colors.text.tertiary,
                  alignItems: 'center',
                  paddingLeft: '64px',
                  paddingTop: isHovered ? spacing.xs : '0',
                  opacity: isHovered ? 1 : 0,
                  transform: isHovered ? 'translateY(0)' : 'translateY(-4px)',
                  transition:
                    'max-height 0.4s cubic-bezier(0.23, 1, 0.32, 1), padding-top 0.4s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.5s cubic-bezier(0.23, 1, 0.32, 1) 0.15s, transform 0.5s cubic-bezier(0.23, 1, 0.32, 1) 0.15s',
                  pointerEvents: 'none',
                  maxHeight: isHovered ? '50px' : '0',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.secondary,
                    minWidth: '20px'
                  }}
                >
                  {cell.count}
                </div>
                <div
                  style={{
                    width: '1px',
                    height: '12px',
                    backgroundColor: colors.border.primary,
                    opacity: 0.5
                  }}
                />
                <div
                  style={{
                    display: 'flex',
                    gap: spacing.xs,
                    alignItems: 'baseline'
                  }}
                >
                  <span style={{ opacity: 0.6, fontSize: '10px' }}>moy</span>
                  <span
                    style={{
                      color: colors.text.secondary,
                      fontWeight: typography.fontWeight.medium
                    }}
                  >
                    {cellAvgDuration.toFixed(1)}s
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: spacing.xs,
                    alignItems: 'baseline'
                  }}
                >
                  <span style={{ opacity: 0.6, fontSize: '10px' }}>total</span>
                  <span
                    style={{
                      color: colors.text.secondary,
                      fontWeight: typography.fontWeight.medium
                    }}
                  >
                    {cellTotalDuration >= 60
                      ? `${(cellTotalDuration / 60).toFixed(1)}m`
                      : `${cellTotalDuration.toFixed(0)}s`}
                  </span>
                </div>
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
        @keyframes statsIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes rulerIn {
          from {
            opacity: 0;
            transform: scaleY(0);
          }
          to {
            opacity: 1;
            transform: scaleY(1);
          }
        }

        /* Responsive styles */
        @media (max-width: 1100px) {
          .global-stats {
            max-width: 100% !important;
            padding-right: 16px !important;
            gap: 12px !important;
          }
          .timeline-stack {
            max-width: 100% !important;
            padding: 0 8px;
          }
        }

        @media (max-width: 900px) {
          .daily-timeline-container {
            padding: 16px !important;
          }
          .global-stats {
            gap: 8px !important;
            font-size: 10px !important;
          }
          .timeline-row {
            gap: 8px !important;
          }
          .date-label {
            min-width: 40px !important;
            font-size: 10px !important;
          }
        }

        @media (max-width: 768px) {
          .global-stats {
            justify-content: center !important;
            padding-right: 0 !important;
            margin-bottom: 12px !important;
          }
          .row-stats {
            padding-left: 44px !important;
            font-size: 10px !important;
          }
          .timeline-row {
            gap: 6px !important;
          }
          .date-label {
            min-width: 35px !important;
          }
        }

        @media (max-width: 480px) {
          .daily-timeline-container {
            padding: 12px !important;
          }
          .global-stats {
            flex-wrap: wrap;
            gap: 6px !important;
            font-size: 9px !important;
          }
          .global-stats > div {
            gap: 4px !important;
          }
          .row-stats {
            padding-left: 36px !important;
            font-size: 9px !important;
            gap: 8px !important;
          }
          .timeline-row {
            gap: 4px !important;
          }
          .date-label {
            min-width: 30px !important;
            font-size: 9px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DailyTimelineGridChart;
