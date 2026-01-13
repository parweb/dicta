import { ElectronAPI } from '@electron-toolkit/preload';

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
}

declare global {
  interface Window {
    electron: ElectronAPI;
    api: CustomAPI;
  }
}
