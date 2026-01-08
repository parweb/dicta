import { BarChart3, History } from 'lucide-react';
import { ReactNode } from 'react';

import { components, colors, spacing } from '../lib/design-system';

interface LayoutProps {
  children: ReactNode;
  currentView: 'home' | 'statistics';
  onViewChange: (view: 'home' | 'statistics') => void;
  onHistoryToggle: () => void;
}

const Layout = ({
  children,
  currentView,
  onViewChange,
  onHistoryToggle
}: LayoutProps) => {
  return (
    <>
      {/* Draggable area - entire window */}
      <div
        style={
          {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            WebkitAppRegion: 'drag'
          } as React.CSSProperties
        }
      />

      {/* Top left buttons */}
      <div
        style={{
          position: 'fixed',
          top: spacing.md,
          left: spacing.md,
          zIndex: 1000,
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
          onClick={() => onViewChange(currentView === 'home' ? 'statistics' : 'home')}
          style={
            {
              ...components.button.base,
              ...components.button.icon
            } as React.CSSProperties
          }
          title={currentView === 'home' ? 'Statistiques' : 'Accueil'}
        >
          <BarChart3 size={18} color={colors.text.primary} />
        </button>
      </div>

      {/* Background */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: colors.background.primary,
          zIndex: 0
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          zIndex: 1
        }}
      >
        {children}
      </div>
    </>
  );
};

export default Layout;
