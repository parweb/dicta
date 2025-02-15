import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const api = {
  onShowMiniAppHotKey: callback =>
    ipcRenderer.on('show-mini-app-hot-key', callback),
  removeShowMiniAppHotKey: callback =>
    ipcRenderer.removeListener('show-mini-app-hot-key', callback)
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
