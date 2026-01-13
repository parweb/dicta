import { ElectronAPI } from '@electron-toolkit/preload';
import { IpcRendererEvent } from 'electron';

interface CustomAPI {
  send: (channel: string, data?: unknown) => void;
  on: (channel: string, callback: (...args: unknown[]) => void) => void;
  removeListener: (
    channel: string,
    callback: (...args: unknown[]) => void
  ) => void;
  history: {
    ensureDir: () => Promise<{ success: boolean; error?: string }>;
    save: (
      transcription: unknown
    ) => Promise<{ success: boolean; filename?: string; error?: string }>;
    loadAll: () => Promise<{
      success: boolean;
      transcriptions: unknown[];
      error?: string;
    }>;
  };
  theme: {
    load: () => Promise<{
      success: boolean;
      theme: unknown | null;
      error?: string;
    }>;
    save: (theme: unknown) => Promise<{ success: boolean; error?: string }>;
    reset: () => Promise<{ success: boolean; error?: string }>;
  };
  credentials: {
    checkEncryptionAvailable: () => Promise<{
      success: boolean;
      available: boolean;
      error?: string;
    }>;
    saveApiKey: (apiKey: string) => Promise<{
      success: boolean;
      error?: string;
    }>;
    loadApiKey: () => Promise<{
      success: boolean;
      apiKey: string | null;
      error?: string;
    }>;
    deleteApiKey: () => Promise<{
      success: boolean;
      error?: string;
    }>;
  };
  updates: {
    getCurrentVersion: () => Promise<{
      success: boolean;
      version?: string;
      channel?: 'stable' | 'beta';
      error?: string;
    }>;
    getChannel: () => Promise<{
      success: boolean;
      channel?: 'stable' | 'beta';
      error?: string;
    }>;
    setChannel: (channel: 'stable' | 'beta') => Promise<{
      success: boolean;
      error?: string;
    }>;
    checkNow: () => Promise<{
      success: boolean;
      error?: string;
    }>;
    getLastCheckTime: () => Promise<{
      success: boolean;
      lastCheck?: number | null;
      error?: string;
    }>;
    onStatus: (
      callback: (event: IpcRendererEvent, data: unknown) => void
    ) => void;
    onProgress: (
      callback: (event: IpcRendererEvent, data: unknown) => void
    ) => void;
    removeStatusListener: (
      callback: (event: IpcRendererEvent, data: unknown) => void
    ) => void;
    removeProgressListener: (
      callback: (event: IpcRendererEvent, data: unknown) => void
    ) => void;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
    api: CustomAPI;
  }
}
