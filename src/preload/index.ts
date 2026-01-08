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
