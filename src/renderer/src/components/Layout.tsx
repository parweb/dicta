import { BarChart3, History, Settings } from 'lucide-react';
import { ReactNode } from 'react';

import type { Transcription } from '../lib/history';
import { useThemeStore } from '@/hooks/useThemeStore';
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
  const { theme } = useThemeStore();
  const { colors, spacing } = theme;

  return (
    <>
      {/* Main layout context */}
      <div className="fixed inset-0 isolate z-0">
        {/* Draggable area - entire window */}
        <div
          className="fixed inset-0 z-0"
          style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        />

        {/* Background */}
        <div
          className="fixed inset-0 z-[1]"
          style={{ backgroundColor: colors.background.primary }}
        />

        {/* Content */}
        <div className="relative w-full h-screen z-[2]">{children}</div>

        {/* Top left buttons */}
        <div
          className="fixed z-[3] flex"
          style={{
            top: spacing.md,
            left: spacing.md,
            gap: spacing.sm,
            WebkitAppRegion: 'no-drag'
          }}
        >
          {/* History toggle button */}
          <button
            onClick={onHistoryToggle}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: spacing.sm,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px'
            }}
            title="Historique"
          >
            <History size={18} color={colors.text.primary} />
          </button>

          {/* Statistics button */}
          <button
            onClick={() => onViewChange('statistics')}
            style={{
              background: currentView === 'statistics' ? colors.text.primary : 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: spacing.sm,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: currentView === 'statistics' ? '50%' : '8px'
            }}
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
            style={{
              background: currentView === 'settings' ? colors.text.primary : 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: spacing.sm,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: currentView === 'settings' ? '50%' : '8px'
            }}
            title="Paramètres"
          >
            <Settings
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
        className="fixed inset-0 isolate z-[1]"
        style={{ pointerEvents: isHistoryOpen ? 'auto' : 'none' }}
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
