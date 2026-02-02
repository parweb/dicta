import { useThemeStore } from '@/hooks/useThemeStore';
import type { Transcription } from '@/lib/history';
import { useApiKeyStore } from '@renderer/hooks/useApiKeyStore';
import { useTranscriptionAPI } from '@renderer/hooks/useTranscriptionAPI';
import { useTranscriptionNavigation } from '@renderer/hooks/useTranscriptionNavigation';
import { BarChart3, Search, Settings } from 'lucide-react';
import { ReactNode } from 'react';
import ProxyStatusIndicators from './home/ProxyStatusIndicators';

interface LayoutProps {
  children: ReactNode;
  currentView: 'home' | 'statistics' | 'settings';
  onViewChange: (view: 'home' | 'statistics' | 'settings') => void;
  onHistoryToggle: () => void;
  onHistoryClose: () => void;
  isHistoryOpen: boolean;
  currentTranscript: string;
  onSelectTranscription: (transcription: Transcription) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  filteredCount?: number;
  totalCount?: number;
}

const Layout = ({
  children,
  currentView,
  onViewChange,
  searchQuery = '',
  onSearchChange,
  filteredCount,
  totalCount
}: LayoutProps) => {
  const { apiKey } = useApiKeyStore();
  const { reloadTranscriptions } = useTranscriptionNavigation();
  const { proxyStatuses } = useTranscriptionAPI(apiKey, reloadTranscriptions);

  const {
    theme: { colors, spacing, typography }
  } = useThemeStore();

  return (
    <div
      id="layout"
      className="relative flex h-screen w-full flex-col gap-5 p-4"
      style={{
        backgroundColor: colors.background.primary,
        WebkitAppRegion: 'drag'
      }}
    >
      <header className="flex items-center justify-between gap-4" style={{}}>
        <div
          className="flex items-center gap-5"
          style={{ WebkitAppRegion: 'no-drag' }}
        >
          <div className="flex items-center gap-2">
            {/* <button
            onClick={onHistoryToggle}
            style={{
              backgroundColor: 'transparent',
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
          </button> */}

            <button
              className="hover:bg-black/10"
              onClick={() => onViewChange('statistics')}
              style={{
                backgroundColor:
                  currentView === 'statistics'
                    ? colors.text.primary
                    : 'transparent',
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

            <button
              className="hover:bg-black/10"
              onClick={() => onViewChange('settings')}
              style={{
                backgroundColor:
                  currentView === 'settings'
                    ? colors.text.primary
                    : 'transparent',
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

          {onSearchChange && (
            <div className="flex items-center gap-2">
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Search
                  size={14}
                  color={colors.text.tertiary}
                  style={{
                    position: 'absolute',
                    left: spacing.sm,
                    pointerEvents: 'none'
                  }}
                />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => onSearchChange(e.target.value)}
                  placeholder="Rechercher..."
                  style={{
                    backgroundColor: colors.background.secondary + '80',
                    border: `1px solid ${colors.border.primary}`,
                    borderRadius: '8px',
                    padding: `${spacing.xs} ${spacing.sm} ${spacing.xs} 32px`,
                    fontSize: typography.fontSize.sm,
                    color: colors.text.primary,
                    outline: 'none',
                    width: '200px',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={e => {
                    e.target.style.backgroundColor =
                      colors.background.secondary;
                    e.target.style.borderColor = colors.border.secondary;
                  }}
                  onBlur={e => {
                    e.target.style.backgroundColor =
                      colors.background.secondary + '80';
                    e.target.style.borderColor = colors.border.primary;
                  }}
                />
              </div>

              {filteredCount !== undefined && totalCount !== undefined && (
                <div
                  style={{
                    fontSize: typography.fontSize.xs,
                    color: colors.text.tertiary,
                    fontFamily: 'JetBrains Mono, monospace',
                    padding: `${spacing.xs} ${spacing.sm}`,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {filteredCount}/{totalCount}
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <ProxyStatusIndicators proxyStatuses={proxyStatuses} />
        </div>
      </header>

      <main
        style={{ WebkitAppRegion: 'no-drag' }}
        className="flex flex-1 flex-col self-stretch overflow-hidden"
      >
        {children}
      </main>

      {/* <div
        className="fixed inset-0 isolate z-1"
        style={{ pointerEvents: isHistoryOpen ? 'auto' : 'none' }}
      >
        <HistorySidebar
          isOpen={isHistoryOpen}
          onClose={onHistoryClose}
          onSelectTranscription={onSelectTranscription}
          currentTranscript={currentTranscript}
        />
      </div> */}
    </div>
  );
};

export default Layout;
