import { useState } from 'react';

import { borderRadius, colors, spacing, typography } from '../../lib/design-system';
import { formatDuration } from '../../lib/statistics';
import type { UsageData } from '../../lib/statistics';

interface TimelineChartProps {
  dailyUsage: UsageData[];
}

interface TimelineEvent {
  timestamp: string;
  count: number;
  minutes: number;
  cost: number;
  date: string;
}

const TimelineChart = ({ dailyUsage }: TimelineChartProps) => {
  const [hoveredEvent, setHoveredEvent] = useState<TimelineEvent | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  if (dailyUsage.length === 0) return null;

  // Parse and prepare events
  const events: TimelineEvent[] = dailyUsage
    .map(usage => {
      // Parse the date string format "12 Jan 14:30"
      const dateMatch = usage.date.match(/(\d{1,2})\s+(\w+)\s+(\d{1,2}):(\d{2})/);
      if (!dateMatch) return null;

      const [, day, month, hour, minute] = dateMatch;
      const monthNum = ['jan', 'fév', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc']
        .findIndex(m => month.toLowerCase().startsWith(m));

      if (monthNum === -1) return null;

      const year = new Date().getFullYear();
      const timestamp = new Date(year, monthNum, parseInt(day), parseInt(hour), parseInt(minute)).getTime();

      return {
        timestamp: timestamp.toString(),
        count: usage.count,
        minutes: usage.minutes,
        cost: usage.cost,
        date: usage.date
      };
    })
    .filter((e): e is TimelineEvent => e !== null)
    .sort((a, b) => parseInt(a.timestamp) - parseInt(b.timestamp));

  if (events.length === 0) return null;

  // Calculate time range
  const minTime = parseInt(events[0].timestamp);
  const maxTime = parseInt(events[events.length - 1].timestamp);
  const timeRange = maxTime - minTime;

  // Chart dimensions
  const chartWidth = Math.max(1200, events.length * 3);
  const chartHeight = 300;
  const maxBarHeight = 200;

  // Calculate max minutes for scaling
  const maxMinutes = Math.max(...events.map(e => e.minutes), 1);

  // Get bar height based on minutes
  const getBarHeight = (minutes: number) => {
    return (minutes / maxMinutes) * maxBarHeight;
  };

  // Get bar color based on intensity
  const getBarColor = (minutes: number) => {
    const intensity = minutes / maxMinutes;
    return `rgba(14, 165, 233, ${0.3 + intensity * 0.7})`;
  };

  const handleMouseEnter = (event: TimelineEvent, e: React.MouseEvent) => {
    setHoveredEvent(event);
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredEvent(null);
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
      <h3
        style={{
          fontSize: typography.fontSize.lg,
          color: colors.text.primary,
          marginBottom: spacing.lg,
          fontWeight: typography.fontWeight.semibold
        }}
      >
        Timeline des transcriptions
      </h3>

      <div
        style={{
          overflowX: 'auto',
          overflowY: 'hidden',
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
            alignItems: 'flex-end',
            gap: '2px'
          }}
        >
          {events.map((event, index) => {
            const x = ((parseInt(event.timestamp) - minTime) / timeRange) * chartWidth;
            const height = getBarHeight(event.minutes);

            return (
              <div
                key={index}
                onMouseEnter={(e) => handleMouseEnter(event, e)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  position: 'absolute',
                  left: `${x}px`,
                  bottom: '20px',
                  width: '4px',
                  height: `${height}px`,
                  backgroundColor: getBarColor(event.minutes),
                  borderRadius: borderRadius.xs,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  transformOrigin: 'bottom'
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
          <span>{events[0].date}</span>
          {events.length > 2 && (
            <span>{events[Math.floor(events.length / 2)].date}</span>
          )}
          <span>{events[events.length - 1].date}</span>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          marginTop: spacing.lg,
          fontSize: typography.fontSize.sm,
          color: colors.text.secondary
        }}
      >
        <div>{events.length} événements affichés</div>
        <div style={{ marginTop: spacing.xs }}>
          Durée totale: {formatDuration(events.reduce((sum, e) => sum + e.minutes, 0))}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredEvent && (
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
            minWidth: '200px'
          }}
        >
          <div
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.tertiary,
              marginBottom: spacing.xs
            }}
          >
            {hoveredEvent.date}
          </div>
          <div
            style={{
              fontSize: typography.fontSize.base,
              color: colors.text.primary,
              fontWeight: typography.fontWeight.semibold
            }}
          >
            {hoveredEvent.count} requêtes
          </div>
          <div
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.secondary,
              marginTop: spacing.xs
            }}
          >
            {formatDuration(hoveredEvent.minutes)} • ${hoveredEvent.cost.toFixed(4)}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineChart;
