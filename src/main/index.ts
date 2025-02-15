import { app, shell, BrowserWindow, ipcMain, globalShortcut } from 'electron';
import { join } from 'node:path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';

// Declare the mainWindow variable in a scope accessible to the shortcut callback.
let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    frame: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: false,
      sandbox: false
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler(details => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // Load the URL for development or the local HTML file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  // Set app user model id for Windows.
  electronApp.setAppUserModelId('com.electron');

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  ipcMain.on('ping', () => console.log('pong'));

  createWindow();

  // Register the global shortcut to bring the app to the front.
  const shortcutRegistered = globalShortcut.register(
    'CommandOrControl+Shift+X',
    () => {
      console.log('Global shortcut triggered!');
      if (mainWindow) {
        // Restore if minimized
        if (mainWindow.isMinimized()) {
          mainWindow.restore();
        }

        // Workaround to force the window onto the current desktop:
        if (process.platform === 'darwin') {
          // On macOS, temporarily show the window on all workspaces.
          mainWindow.setVisibleOnAllWorkspaces(true, {
            visibleOnFullScreen: true
          });

          app.dock.show();
        } else {
          // On Windows/Linux, set the window as always on top.
          mainWindow.setAlwaysOnTop(true);
        }

        // Bring window to foreground and focus it.
        mainWindow.show();
        mainWindow.focus();

        mainWindow.webContents.send('show-mini-app-hot-key');

        // Revert the temporary settings after a short delay.
        setTimeout(() => {
          if (process.platform === 'darwin') {
            mainWindow.setVisibleOnAllWorkspaces(false);
          } else {
            mainWindow.setAlwaysOnTop(false);
          }
        }, 1000);
      }
    }
  );

  if (!shortcutRegistered) {
    console.error('Global shortcut registration failed.');
  }

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the dock icon is clicked
    // and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Unregister all shortcuts when the app is about to quit.
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
