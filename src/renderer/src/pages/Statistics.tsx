import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import {
  borderRadius,
  colors,
  spacing,
  typography
} from '../lib/design-system';
import type { Transcription } from '../lib/history';
import {
  calculateStatistics,
  formatCost,
  formatDuration,
  type UsageStatistics
} from '../lib/statistics';

interface StatisticsProps {
  onBack: () => void;
}

const Statistics = ({ onBack }: StatisticsProps) => {
  const [stats, setStats] = useState<UsageStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    setIsLoading(true);
    try {
      const result = await window.api?.history.loadAll();
      if (result?.success && result.transcriptions) {
        const transcriptions = result.transcriptions as Transcription[];
        const statistics = calculateStatistics(transcriptions);
        setStats(statistics);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: colors.background.primary,
        WebkitAppRegion: 'no-drag'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: spacing.xl,
          borderBottom: `1px solid ${colors.border.primary}`,
          display: 'flex',
          alignItems: 'center',
          gap: spacing.md
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: spacing.sm,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: borderRadius.md,
            color: colors.text.secondary,
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1
          style={{
            margin: 0,
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary
          }}
        >
          Statistiques d'utilisation
        </h1>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: spacing['2xl']
        }}
      >
        {isLoading ? (
          <div
            style={{
              textAlign: 'center',
              padding: spacing['4xl'],
              color: colors.text.tertiary
            }}
          >
            Chargement des statistiques...
          </div>
        ) : !stats || stats.totalTranscriptions === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: spacing['4xl'],
              color: colors.text.tertiary
            }}
          >
            Aucune donnée disponible. Commencez par créer des transcriptions !
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: spacing.lg,
                marginBottom: spacing['3xl']
              }}
            >
              <div
                style={{
                  padding: spacing.xl,
                  backgroundColor: colors.background.secondary,
                  borderRadius: borderRadius.lg,
                  border: `1px solid ${colors.border.primary}`
                }}
              >
                <div
                  style={{
                    fontSize: typography.fontSize.base,
                    color: colors.text.tertiary,
                    marginBottom: spacing.sm
                  }}
                >
                  Total de requêtes
                </div>
                <div
                  style={{
                    fontSize: typography.fontSize['2xl'],
                    fontWeight: typography.fontWeight.bold,
                    color: colors.text.primary
                  }}
                >
                  {stats.totalTranscriptions}
                </div>
              </div>

              <div
                style={{
                  padding: spacing.xl,
                  backgroundColor: colors.background.secondary,
                  borderRadius: borderRadius.lg,
                  border: `1px solid ${colors.border.primary}`
                }}
              >
                <div
                  style={{
                    fontSize: typography.fontSize.base,
                    color: colors.text.tertiary,
                    marginBottom: spacing.sm
                  }}
                >
                  Durée estimée
                </div>
                <div
                  style={{
                    fontSize: typography.fontSize['2xl'],
                    fontWeight: typography.fontWeight.bold,
                    color: colors.text.primary
                  }}
                >
                  {formatDuration(stats.totalEstimatedMinutes)}
                </div>
              </div>

              <div
                style={{
                  padding: spacing.xl,
                  backgroundColor: colors.accent.blue.background,
                  borderRadius: borderRadius.lg,
                  border: `1px solid ${colors.accent.blue.primary}`
                }}
              >
                <div
                  style={{
                    fontSize: typography.fontSize.base,
                    color: colors.accent.blue.light,
                    marginBottom: spacing.sm
                  }}
                >
                  Coût estimé
                </div>
                <div
                  style={{
                    fontSize: typography.fontSize['2xl'],
                    fontWeight: typography.fontWeight.bold,
                    color: colors.accent.blue.primary
                  }}
                >
                  {formatCost(stats.totalEstimatedCost)}
                </div>
              </div>
            </div>

            {/* Chart */}
            {stats.dailyUsage.length > 0 && (
              <div
                style={{
                  backgroundColor: colors.background.secondary,
                  borderRadius: borderRadius.lg,
                  border: `1px solid ${colors.border.primary}`,
                  padding: spacing['2xl']
                }}
              >
                <h2
                  style={{
                    margin: `0 0 ${spacing['2xl']} 0`,
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary
                  }}
                >
                  Utilisation quotidienne
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.dailyUsage}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border.primary} />
                    <XAxis
                      dataKey="date"
                      stroke={colors.text.tertiary}
                      style={{ fontSize: typography.fontSize.sm }}
                    />
                    <YAxis
                      stroke={colors.text.tertiary}
                      style={{ fontSize: typography.fontSize.sm }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: colors.background.primary,
                        border: `1px solid ${colors.border.primary}`,
                        borderRadius: borderRadius.md,
                        fontSize: typography.fontSize.base,
                        color: colors.text.secondary
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === 'count') return [value, 'Requêtes'];
                        if (name === 'estimatedCost')
                          return [formatCost(value), 'Coût'];
                        return [value, name];
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: typography.fontSize.base, color: colors.text.tertiary }}
                      formatter={(value: string) => {
                        if (value === 'count') return 'Requêtes';
                        if (value === 'estimatedCost') return 'Coût (USD)';
                        return value;
                      }}
                    />
                    <Bar dataKey="count" fill={colors.accent.blue.primary} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Info note */}
            <div
              style={{
                marginTop: spacing['2xl'],
                padding: spacing.lg,
                backgroundColor: colors.accent.yellow.background,
                borderRadius: borderRadius.lg,
                border: `1px solid ${colors.accent.yellow.primary}`,
                fontSize: typography.fontSize.sm,
                color: colors.accent.yellow.light,
                lineHeight: '1.5'
              }}
            >
              <strong>Note :</strong> Les coûts sont estimés en fonction du
              modèle Whisper d'OpenAI ($0.006/minute). La durée est estimée à
              partir du texte transcrit (~150 mots/minute). Les coûts réels
              peuvent varier.
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Statistics;
