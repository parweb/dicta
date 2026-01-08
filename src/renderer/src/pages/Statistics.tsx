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
        backgroundColor: '#0f172a',
        WebkitAppRegion: 'no-drag'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '20px',
          borderBottom: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
            color: '#e5e7eb',
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
            fontSize: '24px',
            fontWeight: 600,
            color: '#f9fafb'
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
          padding: '24px'
        }}
      >
        {isLoading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              color: '#94a3b8'
            }}
          >
            Chargement des statistiques...
          </div>
        ) : !stats || stats.totalTranscriptions === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              color: '#94a3b8'
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
                gap: '16px',
                marginBottom: '32px'
              }}
            >
              <div
                style={{
                  padding: '20px',
                  backgroundColor: '#1e293b',
                  borderRadius: '8px',
                  border: '1px solid #334155'
                }}
              >
                <div
                  style={{
                    fontSize: '14px',
                    color: '#94a3b8',
                    marginBottom: '8px'
                  }}
                >
                  Total de requêtes
                </div>
                <div
                  style={{
                    fontSize: '32px',
                    fontWeight: 700,
                    color: '#f9fafb'
                  }}
                >
                  {stats.totalTranscriptions}
                </div>
              </div>

              <div
                style={{
                  padding: '20px',
                  backgroundColor: '#1e293b',
                  borderRadius: '8px',
                  border: '1px solid #334155'
                }}
              >
                <div
                  style={{
                    fontSize: '14px',
                    color: '#94a3b8',
                    marginBottom: '8px'
                  }}
                >
                  Durée estimée
                </div>
                <div
                  style={{
                    fontSize: '32px',
                    fontWeight: 700,
                    color: '#f9fafb'
                  }}
                >
                  {formatDuration(stats.totalEstimatedMinutes)}
                </div>
              </div>

              <div
                style={{
                  padding: '20px',
                  backgroundColor: 'rgba(14, 165, 233, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid #0ea5e9'
                }}
              >
                <div
                  style={{
                    fontSize: '14px',
                    color: '#38bdf8',
                    marginBottom: '8px'
                  }}
                >
                  Coût estimé
                </div>
                <div
                  style={{
                    fontSize: '32px',
                    fontWeight: 700,
                    color: '#0ea5e9'
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
                  backgroundColor: '#1e293b',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  padding: '24px'
                }}
              >
                <h2
                  style={{
                    margin: '0 0 24px 0',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#f9fafb'
                  }}
                >
                  Utilisation quotidienne
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.dailyUsage}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="date"
                      stroke="#94a3b8"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      style={{ fontSize: '12px' }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        fontSize: '14px',
                        color: '#e5e7eb'
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === 'count') return [value, 'Requêtes'];
                        if (name === 'estimatedCost')
                          return [formatCost(value), 'Coût'];
                        return [value, name];
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '14px', color: '#94a3b8' }}
                      formatter={(value: string) => {
                        if (value === 'count') return 'Requêtes';
                        if (value === 'estimatedCost') return 'Coût (USD)';
                        return value;
                      }}
                    />
                    <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Info note */}
            <div
              style={{
                marginTop: '24px',
                padding: '16px',
                backgroundColor: 'rgba(234, 179, 8, 0.1)',
                borderRadius: '8px',
                border: '1px solid #eab308',
                fontSize: '13px',
                color: '#fef08a',
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
