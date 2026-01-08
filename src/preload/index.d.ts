import { ElectronAPI } from '@electron-toolkit/preload';

interface CustomAPI {
  send: (channel: string, data?: unknown) => void;
  on: (channel: string, callback: (...args: unknown[]) => void) => void;
  removeListener: (
    channel: string,
    callback: (...args: unknown[]) => void
  ) => void;
}

declare global {
  interface Window {
    electron: ElectronAPI;
    api: CustomAPI;
  }
}
