import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';
import { IpcRendererEvent } from 'electron';

/**
 * Update status types
 */
export type UpdateStatus = 'idle' | 'checking' | 'downloading' | 'ready' | 'up-to-date' | 'error';

export interface UpdateInfo {
  status: UpdateStatus;
  message?: string;
  version?: string;
  error?: string;
}

export interface UpdateProgress {
  percent: number;
  bytesPerSecond: number;
  transferred: number;
  total: number;
}

/**
 * Update context value
 */
interface UpdateContextValue {
  currentVersion: string;
  channel: 'stable' | 'beta';
  updateInfo: UpdateInfo;
  progress: UpdateProgress | null;
  lastCheckTime: number | null;
  isLoading: boolean;
  setChannel: (channel: 'stable' | 'beta') => Promise<boolean>;
  checkForUpdates: () => Promise<boolean>;
  refreshStatus: () => Promise<void>;
}

const UpdateContext = createContext<UpdateContextValue | undefined>(undefined);

/**
 * Hook to access update context
 */
export function useUpdate(): UpdateContextValue {
  const context = useContext(UpdateContext);
  if (context === undefined) {
    throw new Error('useUpdate must be used within an UpdateProvider');
  }
  return context;
}

/**
 * Update Provider component
 */
export function UpdateProvider({ children }: { children: React.ReactNode }) {
  const [currentVersion, setCurrentVersion] = useState<string>('1.0.0');
  const [channel, setChannelState] = useState<'stable' | 'beta'>('stable');
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>({
    status: 'idle'
  });
  const [progress, setProgress] = useState<UpdateProgress | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load initial data
   */
  const refreshStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get current version and channel
      const versionResult = await window.api?.updates.getCurrentVersion();
      if (versionResult?.success) {
        setCurrentVersion(versionResult.version || '1.0.0');
        setChannelState(versionResult.channel || 'stable');
      }

      // Get last check time
      const lastCheckResult = await window.api?.updates.getLastCheckTime();
      if (lastCheckResult?.success) {
        setLastCheckTime(lastCheckResult.lastCheck || null);
      }
    } catch (error) {
      console.error('[UPDATE-CONTEXT] Error loading update status:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Set update channel
   */
  const setChannel = useCallback(async (newChannel: 'stable' | 'beta') => {
    try {
      const result = await window.api?.updates.setChannel(newChannel);
      if (result?.success) {
        setChannelState(newChannel);
        console.log('[UPDATE-CONTEXT] Update channel changed to:', newChannel);
        return true;
      }
      return false;
    } catch (error) {
      console.error('[UPDATE-CONTEXT] Error changing update channel:', error);
      return false;
    }
  }, []);

  /**
   * Manually check for updates
   */
  const checkForUpdates = useCallback(async () => {
    try {
      const result = await window.api?.updates.checkNow();
      if (result?.success) {
        setLastCheckTime(Date.now());
        return true;
      }
      return false;
    } catch (error) {
      console.error('[UPDATE-CONTEXT] Error checking for updates:', error);
      return false;
    }
  }, []);

  /**
   * Set up event listeners for update status
   */
  useEffect(() => {
    const handleStatus = (_event: IpcRendererEvent, data: unknown) => {
      const updateData = data as UpdateInfo;
      console.log('[UPDATE-CONTEXT] Status update:', updateData);
      setUpdateInfo(updateData);
      if (updateData.status === 'checking') {
        setLastCheckTime(Date.now());
      }
    };

    const handleProgress = (_event: IpcRendererEvent, data: unknown) => {
      const progressData = data as UpdateProgress;
      console.log('[UPDATE-CONTEXT] Progress update:', progressData.percent + '%');
      setProgress(progressData);
    };

    window.api?.updates.onStatus(handleStatus);
    window.api?.updates.onProgress(handleProgress);

    // Load initial data
    refreshStatus();

    // Cleanup
    return () => {
      window.api?.updates.removeStatusListener(handleStatus);
      window.api?.updates.removeProgressListener(handleProgress);
    };
  }, [refreshStatus]);

  const value: UpdateContextValue = {
    currentVersion,
    channel,
    updateInfo,
    progress,
    lastCheckTime,
    isLoading,
    setChannel,
    checkForUpdates,
    refreshStatus
  };

  return (
    <UpdateContext.Provider value={value}>{children}</UpdateContext.Provider>
  );
}
