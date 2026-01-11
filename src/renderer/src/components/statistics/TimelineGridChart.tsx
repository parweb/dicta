import { useMemo, useState } from 'react';

import { borderRadius, colors, spacing, typography } from '../../lib/design-system';
import type { Transcription } from '../../lib/history';

interface TimelineGridChartProps {
  transcriptions: Transcription[];
}

interface HourlyCell {
  dateKey: string;
  dayLabel: string;
  hour: number;
  count: number;
  transcriptions: Transcription[];
}

const TimelineGridChart = ({ transcriptions }: TimelineGridChartProps) => {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

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

  // Generate cells for last 7 days, only hours with data
  const cells = useMemo(() => {
    const result: HourlyCell[] = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    for (let d = 0; d < 7; d++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + d);

      for (let h = 0; h < 24; h++) {
        const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}-${String(h).padStart(2, '0')}`;
        const dayLabel = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        const cellTranscriptions = hourlyData.get(dateKey) || [];

        if (cellTranscriptions.length > 0) {
          result.push({
            dateKey,
            dayLabel,
            hour: h,
            count: cellTranscriptions.length,
            transcriptions: cellTranscriptions
          });
        }
      }
    }

    return result.sort((a, b) => {
      const aDate = new Date(a.dateKey);
      const bDate = new Date(b.dateKey);
      return bDate.getTime() - aDate.getTime();
    });
  }, [hourlyData]);

  if (cells.length === 0) {
    return (
      <div
        style={{
          padding: spacing['2xl'],
          textAlign: 'center',
          color: colors.text.tertiary
        }}
      >
        Aucune donnée disponible pour les 7 derniers jours
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
      {/* Grid of timeline cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: spacing.lg,
          maxWidth: '1400px',
          margin: '0 auto'
        }}
      >
        {cells.map((cell) => {
          const isHovered = hoveredCell === cell.dateKey;
          const avgDuration = cell.transcriptions.reduce((sum, t) => sum + (t.durationMs || 0), 0) / cell.count / 1000;

          return (
            <div
              key={cell.dateKey}
              onMouseEnter={() => setHoveredCell(cell.dateKey)}
              onMouseLeave={() => setHoveredCell(null)}
              style={{
                backgroundColor: isHovered ? colors.background.tertiary : colors.background.secondary,
                borderRadius: borderRadius.md,
                padding: spacing.md,
                border: `1px solid ${isHovered ? colors.border.secondary : colors.border.primary}`,
                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: isHovered ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
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
                <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary }}>
                  {cell.dayLabel} · {String(cell.hour).padStart(2, '0')}h
                </div>
                <div style={{ fontSize: typography.fontSize.sm, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>
                  {cell.count}
                </div>
              </div>

              {/* Timeline graph */}
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
                  {cell.transcriptions.map((t, idx) => {
                    const date = new Date(t.timestamp);
                    const minute = date.getMinutes();
                    const seconds = date.getSeconds();
                    const totalSeconds = minute * 60 + seconds;
                    const position = (totalSeconds / 3600) * 100;
                    const duration = t.durationMs || 0;
                    const maxDuration = Math.max(...cell.transcriptions.map(t => t.durationMs || 0), 1);
                    const size = Math.max(7, (duration / maxDuration) * 14 + 7);

                    return (
                      <div
                        key={t.id}
                        title={`${minute}:${String(seconds).padStart(2, '0')} - ${(duration / 1000).toFixed(1)}s`}
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
                          zIndex: cell.transcriptions.length - idx,
                          animation: `markerFadeIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 0.05}s both`
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
                <span style={{ color: colors.accent.blue.primary, fontWeight: typography.fontWeight.medium }}>
                  {avgDuration.toFixed(1)}s
                </span>
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
      `}</style>
    </div>
  );
};

export default TimelineGridChart;
