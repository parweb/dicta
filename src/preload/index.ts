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
    load: (): Promise<{ success: boolean; theme: unknown | null; error?: string }> =>
      ipcRenderer.invoke('theme:load'),
    save: (
      theme: unknown
    ): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke('theme:save', theme),
    reset: (): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke('theme:reset')
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
