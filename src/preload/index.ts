import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const api = {
  send: (channel: string, data?: unknown): void => {
    ipcRenderer.send(channel, data);
  },
  on: (
    channel: string,
    callback: (event: IpcRendererEvent, ...args: unknown[]) => void
  ): void => {
    ipcRenderer.on(channel, callback);
  },
  removeListener: (
    channel: string,
    callback: (event: IpcRendererEvent, ...args: unknown[]) => void
  ): void => {
    ipcRenderer.removeListener(channel, callback);
  },
  // History management
  history: {
    ensureDir: (): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke('history:ensure-dir'),
    save: (
      transcription: unknown
    ): Promise<{ success: boolean; filename?: string; error?: string }> =>
      ipcRenderer.invoke('history:save', transcription),
    loadAll: (): Promise<{
      success: boolean;
      transcriptions: unknown[];
      error?: string;
    }> => ipcRenderer.invoke('history:load-all')
  },
  // Theme configuration management
  theme: {
    load: (): Promise<{
      success: boolean;
      theme: unknown | null;
      error?: string;
    }> => ipcRenderer.invoke('theme:load'),
    save: (theme: unknown): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke('theme:save', theme),
    reset: (): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke('theme:reset')
  },
  // Credentials management
  credentials: {
    checkEncryptionAvailable: (): Promise<{
      success: boolean;
      available: boolean;
      error?: string;
    }> => ipcRenderer.invoke('credentials:check-encryption-available'),
    saveApiKey: (
      apiKey: string
    ): Promise<{
      success: boolean;
      error?: string;
    }> => ipcRenderer.invoke('credentials:save-api-key', apiKey),
    loadApiKey: (): Promise<{
      success: boolean;
      apiKey: string | null;
      error?: string;
    }> => ipcRenderer.invoke('credentials:load-api-key'),
    deleteApiKey: (): Promise<{
      success: boolean;
      error?: string;
    }> => ipcRenderer.invoke('credentials:delete-api-key')
  },
  // Update management
  updates: {
    getCurrentVersion: (): Promise<{
      success: boolean;
      version?: string;
      channel?: 'stable' | 'beta';
      error?: string;
    }> => ipcRenderer.invoke('update:get-current-version'),
    getChannel: (): Promise<{
      success: boolean;
      channel?: 'stable' | 'beta';
      error?: string;
    }> => ipcRenderer.invoke('update:get-channel'),
    setChannel: (channel: 'stable' | 'beta'): Promise<{
      success: boolean;
      error?: string;
    }> => ipcRenderer.invoke('update:set-channel', channel),
    checkNow: (): Promise<{
      success: boolean;
      error?: string;
    }> => ipcRenderer.invoke('update:check-now'),
    getLastCheckTime: (): Promise<{
      success: boolean;
      lastCheck?: number | null;
      error?: string;
    }> => ipcRenderer.invoke('update:get-last-check-time'),
    onStatus: (
      callback: (event: IpcRendererEvent, data: unknown) => void
    ): void => {
      ipcRenderer.on('update:status', callback);
    },
    onProgress: (
      callback: (event: IpcRendererEvent, data: unknown) => void
    ): void => {
      ipcRenderer.on('update:progress', callback);
    },
    removeStatusListener: (
      callback: (event: IpcRendererEvent, data: unknown) => void
    ): void => {
      ipcRenderer.removeListener('update:status', callback);
    },
    removeProgressListener: (
      callback: (event: IpcRendererEvent, data: unknown) => void
    ): void => {
      ipcRenderer.removeListener('update:progress', callback);
    }
  }
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}

window.addEventListener('DOMContentLoaded', () => {
  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then(stream => {
      console.log('Microphone access granted:', stream);
    })
    .catch(error => {
      console.error('Microphone access denied:', error);
    });
});
