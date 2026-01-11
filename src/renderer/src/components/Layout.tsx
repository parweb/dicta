import { BarChart3, History, Palette } from 'lucide-react';
import { ReactNode } from 'react';

import type { Transcription } from '../lib/history';
import { useTheme } from '../lib/theme-context';
import HistorySidebar from './HistorySidebar';

interface LayoutProps {
  children: ReactNode;
  currentView: 'home' | 'statistics' | 'settings';
  onViewChange: (view: 'home' | 'statistics' | 'settings') => void;
  onHistoryToggle: () => void;
  onHistoryClose: () => void;
  isHistoryOpen: boolean;
  currentTranscript: string;
  onSelectTranscription: (transcription: Transcription) => void;
}

const Layout = ({
  children,
  currentView,
  onViewChange,
  onHistoryToggle,
  onHistoryClose,
  isHistoryOpen,
  currentTranscript,
  onSelectTranscription
}: LayoutProps) => {
  const { theme } = useTheme();
  const { colors, spacing, components } = theme;

  return (
    <>
      {/* Main layout context */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          isolation: 'isolate',
          zIndex: 0
        }}
      >
        {/* Draggable area - entire window */}
        <div
          style={
            {
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 0,
              WebkitAppRegion: 'drag'
            } as React.CSSProperties
          }
        />

        {/* Background */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors.background.primary,
            zIndex: 1
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100vh',
            zIndex: 2
          }}
        >
          {children}
        </div>

        {/* Top left buttons */}
        <div
          style={{
            position: 'fixed',
            top: spacing.md,
            left: spacing.md,
            zIndex: 3,
            display: 'flex',
            gap: spacing.sm,
            WebkitAppRegion: 'no-drag'
          }}
        >
          {/* History toggle button */}
          <button
            onClick={onHistoryToggle}
            style={
              {
                ...components.button.base,
                ...components.button.icon
              } as React.CSSProperties
            }
            title="Historique"
          >
            <History size={18} color={colors.text.primary} />
          </button>

          {/* Statistics button */}
          <button
            onClick={() => onViewChange('statistics')}
            style={
              {
                ...components.button.base,
                ...components.button.icon,
                ...(currentView === 'statistics' && {
                  backgroundColor: colors.text.primary,
                  borderRadius: '50%',
                  padding: spacing.sm
                })
              } as React.CSSProperties
            }
            title="Statistiques"
          >
            <BarChart3
              size={18}
              color={
                currentView === 'statistics'
                  ? colors.background.primary
                  : colors.text.primary
              }
            />
          </button>

          {/* Settings button */}
          <button
            onClick={() => onViewChange('settings')}
            style={
              {
                ...components.button.base,
                ...components.button.icon,
                ...(currentView === 'settings' && {
                  backgroundColor: colors.text.primary,
                  borderRadius: '50%',
                  padding: spacing.sm
                })
              } as React.CSSProperties
            }
            title="Paramètres"
          >
            <Palette
              size={18}
              color={
                currentView === 'settings'
                  ? colors.background.primary
                  : colors.text.primary
              }
            />
          </button>
        </div>
      </div>

      {/* Sidebar context - isolated and above main layout */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          isolation: 'isolate',
          zIndex: 1,
          pointerEvents: isHistoryOpen ? 'auto' : 'none'
        }}
      >
        <HistorySidebar
          isOpen={isHistoryOpen}
          onClose={onHistoryClose}
          onSelectTranscription={onSelectTranscription}
          currentTranscript={currentTranscript}
        />
      </div>
    </>
  );
};

export default Layout;
