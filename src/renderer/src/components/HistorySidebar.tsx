import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  formatRelativeTime,
  getDayLabel,
  type Transcription
} from '../lib/history';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTranscription: (text: string) => void;
}

interface GroupedTranscriptions {
  dayLabel: string;
  transcriptions: Transcription[];
}

const HistorySidebar = ({
  isOpen,
  onClose,
  onSelectTranscription
}: HistorySidebarProps) => {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const result = await window.api?.history.loadAll();
      if (result?.success && result.transcriptions) {
        setTranscriptions(result.transcriptions as Transcription[]);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Group transcriptions by day
  const groupedTranscriptions: GroupedTranscriptions[] = transcriptions.reduce(
    (acc, transcription) => {
      const dayLabel = getDayLabel(transcription.timestamp);
      const existing = acc.find(g => g.dayLabel === dayLabel);
      if (existing) {
        existing.transcriptions.push(transcription);
      } else {
        acc.push({ dayLabel, transcriptions: [transcription] });
      }
      return acc;
    },
    [] as GroupedTranscriptions[]
  );

  const handleTranscriptionClick = (text: string) => {
    onSelectTranscription(text);
    navigator.clipboard.writeText(text);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999,
          WebkitAppRegion: 'no-drag'
        }}
      />

      {/* Sidebar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '320px',
          backgroundColor: '#ffffff',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          WebkitAppRegion: 'no-drag'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
            Historique
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              color: '#6b7280'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px'
          }}
        >
          {isLoading ? (
            <div
              style={{
                textAlign: 'center',
                padding: '20px',
                color: '#6b7280'
              }}
            >
              Chargement...
            </div>
          ) : transcriptions.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '20px',
                color: '#6b7280'
              }}
            >
              Aucune transcription
            </div>
          ) : (
            groupedTranscriptions.map(group => (
              <div key={group.dayLabel} style={{ marginBottom: '24px' }}>
                <h3
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#6b7280',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  {group.dayLabel}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {group.transcriptions.map(transcription => (
                    <div
                      key={transcription.id}
                      onClick={() => handleTranscriptionClick(transcription.text)}
                      style={{
                        padding: '12px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        border: '1px solid #e5e7eb',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                        e.currentTarget.style.borderColor = '#d1d5db';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                      }}
                    >
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#9ca3af',
                          marginBottom: '6px'
                        }}
                      >
                        {formatRelativeTime(transcription.timestamp)}
                      </div>
                      <div
                        style={{
                          fontSize: '14px',
                          color: '#1f2937',
                          lineHeight: '1.4',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {transcription.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default HistorySidebar;
