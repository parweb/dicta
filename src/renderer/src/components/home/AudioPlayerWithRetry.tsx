import { useState, useEffect, useRef } from 'react';
import { RefreshCcw } from 'lucide-react';

import { useTheme } from '../../lib/theme-context';

interface AudioPlayerWithRetryProps {
  audioBlob: Blob;
  error: string;
  onRetry: () => void;
  isLoading: boolean;
}

const AudioPlayerWithRetry = ({
  audioBlob,
  error,
  onRetry,
  isLoading
}: AudioPlayerWithRetryProps) => {
  const { theme } = useTheme();
  const { colors, spacing, typography, borderRadius } = theme;
  const [audioUrl, setAudioUrl] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Create object URL from blob
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);

    // Cleanup function to revoke object URL
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [audioBlob]);

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: colors.background.secondary,
        border: `1px solid ${colors.accent.red.primary}`,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.md,
        WebkitAppRegion: 'no-drag'
      }}
    >
      {/* Error message */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing.sm,
          color: colors.accent.red.primary,
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium
        }}
      >
        <span>⚠</span>
        <span>{error}</span>
      </div>

      {/* Audio player */}
      {audioUrl && (
        <audio
          ref={audioRef}
          controls
          style={{
            width: '100%',
            height: '32px',
            outline: 'none'
          }}
        >
          <source src={audioUrl} type={audioBlob.type} />
          Your browser does not support the audio element.
        </audio>
      )}

      {/* Retry button */}
      <button
        onClick={onRetry}
        disabled={isLoading}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          padding: `${spacing.sm} ${spacing.lg}`,
          backgroundColor: isLoading
            ? colors.background.tertiary
            : colors.accent.blue.primary,
          color: colors.text.primary,
          border: 'none',
          borderRadius: borderRadius.md,
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.6 : 1,
          transition: 'all 0.2s ease',
          ...(isLoading
            ? {}
            : {
                ':hover': {
                  backgroundColor: colors.accent.blue.light
                }
              })
        }}
        onMouseEnter={e => {
          if (!isLoading) {
            e.currentTarget.style.backgroundColor = colors.accent.blue.light;
          }
        }}
        onMouseLeave={e => {
          if (!isLoading) {
            e.currentTarget.style.backgroundColor = colors.accent.blue.primary;
          }
        }}
      >
        <RefreshCcw size={14} />
        <span>{isLoading ? 'Retrying...' : 'Retry Transcription'}</span>
      </button>
    </div>
  );
};

export default AudioPlayerWithRetry;
