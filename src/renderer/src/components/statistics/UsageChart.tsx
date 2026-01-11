import {
  Bar,
  BarChart,
  Brush,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import ChartTooltip from './ChartTooltip';
import { colors, spacing, typography, charts } from '../../lib/design-system';
import type { DailyUsage } from '../../lib/statistics';

interface UsageChartProps {
  dailyUsage: DailyUsage[];
  getBarColor: (minutes: number) => string;
}

const UsageChart = ({ dailyUsage, getBarColor }: UsageChartProps) => {
  // Custom CSS for Brush - magnifying glass effect with hidden travellers
  const brushStyles = `
    /* Remove container border */
    .statistics-chart .recharts-brush > rect:first-child {
      stroke: transparent !important;
    }

    /* Magnifying glass effect on brush slide */
    .statistics-chart .recharts-brush-slide {
      stroke: ${charts.brush.stroke} !important;
      stroke-width: 2 !important;
      fill: ${charts.brush.fill} !important;
      rx: 4 !important;
      ry: 2.86 !important;
      transform: translateY(-15%) scaleY(1.4);
      transform-box: fill-box;
      transform-origin: center center;
    }

    /* Hide travellers visually but keep them interactive */
    .statistics-chart .recharts-brush-traveller,
    .statistics-chart .recharts-brush-traveller * {
      opacity: 0 !important;
      fill: transparent !important;
      stroke: transparent !important;
      outline: none !important;
    }

    .statistics-chart .recharts-brush-traveller:focus,
    .statistics-chart .recharts-brush-traveller:focus *,
    .statistics-chart .recharts-brush-traveller:hover,
    .statistics-chart .recharts-brush-traveller:hover *,
    .statistics-chart .recharts-brush-traveller:active,
    .statistics-chart .recharts-brush-traveller:active * {
      opacity: 0 !important;
      fill: transparent !important;
      stroke: transparent !important;
      outline: none !important;
    }

    .statistics-chart .recharts-brush-traveller {
      cursor: ew-resize !important;
    }
  `;

  if (dailyUsage.length === 0) return null;

  return (
    <div
      style={
        {
          padding: spacing['2xl'],
          WebkitAppRegion: 'no-drag'
        } as React.CSSProperties
      }
    >
      <style>{brushStyles}</style>
      <ResponsiveContainer width="100%" height={400} className="statistics-chart">
        <BarChart data={dailyUsage} margin={{ top: 30, right: 0, left: 0, bottom: 20 }}>
          <XAxis
            dataKey="date"
            stroke={colors.text.tertiary}
            style={{ fontSize: typography.fontSize.xs }}
            axisLine={false}
            tickLine={false}
            interval={Math.floor(dailyUsage.length / 4)}
          />
          <YAxis hide />
          <Tooltip cursor={false} content={<ChartTooltip />} />
          <Bar
            dataKey="minutes"
            radius={[8, 8, 0, 0]}
            shape={(props: any) => {
              const { x, y, width, height, payload } = props;
              return (
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill={getBarColor(payload.minutes)}
                  rx={8}
                  ry={8}
                />
              );
            }}
          />
          <Brush
            dataKey="date"
            height={45}
            stroke="transparent"
            fill="transparent"
            travellerWidth={6}
            startIndex={Math.max(0, dailyUsage.length - 30)}
          >
            <BarChart data={dailyUsage} barCategoryGap="20%">
              <Bar dataKey="minutes" fill={charts.bar.fill} opacity={0.8} maxBarSize={1} />
            </BarChart>
          </Brush>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UsageChart;
