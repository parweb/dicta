import { useState, useMemo } from 'react';

import { borderRadius, colors, spacing, typography } from '../../lib/design-system';
import type { Transcription } from '../../lib/history';

interface SimpleTimelineChartProps {
  transcriptions: Transcription[];
}

const SimpleTimelineChart = ({ transcriptions }: SimpleTimelineChartProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Sort by timestamp
  const sortedTranscriptions = useMemo(() => {
    return [...transcriptions].sort((a, b) => a.timestamp - b.timestamp);
  }, [transcriptions]);

  if (sortedTranscriptions.length === 0) return null;

  const minTime = sortedTranscriptions[0].timestamp;
  const maxTime = sortedTranscriptions[sortedTranscriptions.length - 1].timestamp;
  const timeRange = maxTime - minTime || 1;

  const chartWidth = Math.max(1200, sortedTranscriptions.length * 4);
  const chartHeight = 250;
  const maxBarHeight = 180;

  // Get max duration for scaling
  const maxDuration = Math.max(
    ...sortedTranscriptions.map(t => t.durationMs || 0),
    1
  );

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
        Timeline ({sortedTranscriptions.length} transcriptions)
      </h3>

      <div
        style={{
          overflowX: 'auto',
          backgroundColor: colors.background.secondary,
          borderRadius: borderRadius.lg,
          padding: spacing.lg
        }}
      >
        <div
          style={{
            width: `${chartWidth}px`,
            height: `${chartHeight}px`,
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-end'
          }}
        >
          {sortedTranscriptions.map((t, index) => {
            const x = ((t.timestamp - minTime) / timeRange) * chartWidth;
            const duration = t.durationMs || 1000;
            const height = Math.max(4, (duration / maxDuration) * maxBarHeight);
            const intensity = duration / maxDuration;

            return (
              <div
                key={t.id}
                onMouseEnter={(e) => {
                  setHoveredIndex(index);
                  setMousePosition({ x: e.clientX, y: e.clientY });
                }}
                onMouseMove={(e) => setMousePosition({ x: e.clientX, y: e.clientY })}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  position: 'absolute',
                  left: `${x}px`,
                  bottom: '20px',
                  width: '3px',
                  height: `${height}px`,
                  backgroundColor: `rgba(14, 165, 233, ${0.3 + intensity * 0.7})`,
                  borderRadius: borderRadius.xs,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  transform: hoveredIndex === index ? 'scaleX(2)' : 'scaleX(1)'
                }}
              />
            );
          })}

          {/* Time axis */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '1px',
              backgroundColor: colors.border.primary
            }}
          />
        </div>

        {/* Time labels */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: spacing.md,
            fontSize: typography.fontSize.xs,
            color: colors.text.tertiary
          }}
        >
          <span>{new Date(minTime).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
          <span>{new Date(maxTime).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredIndex !== null && (
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
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
            maxWidth: '300px'
          }}
        >
          <div
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.tertiary,
              marginBottom: spacing.xs
            }}
          >
            {new Date(sortedTranscriptions[hoveredIndex].timestamp).toLocaleString('fr-FR')}
          </div>
          <div
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.secondary,
              marginTop: spacing.xs,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            Durée: {sortedTranscriptions[hoveredIndex].durationMs ? `${(sortedTranscriptions[hoveredIndex].durationMs! / 1000).toFixed(1)}s` : 'N/A'}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleTimelineChart;
