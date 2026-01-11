import { electronApp, is, optimizer } from '@electron-toolkit/utils';
import { app, BrowserWindow, globalShortcut, ipcMain, shell } from 'electron';
import { exec } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync
} from 'node:fs';
import { join } from 'node:path';

import icon from '../../resources/icon.png?asset';

// Déclaration de mainWindow dans un scope accessible
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

  // Charge l'URL de développement ou le fichier HTML en production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  // Définir l'App User Model ID pour Windows.
  electronApp.setAppUserModelId('com.electron');

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  ipcMain.on('ping', () => console.log('pong'));

  // Écoute de l'événement "stop-recording" envoyé par le renderer.
  ipcMain.on('stop-recording', () => {
    console.log(
      'Stop recording déclenché, simulation du collage depuis le presse-papier'
    );

    // Hide our app window to restore focus to previous application before pasting
    if (mainWindow) {
      // mainWindow.minimize();

      // Wait a short moment for focus to be given back to the previous application
      setTimeout(() => {
        pasteClipboard();
      }, 200);
    } else {
      pasteClipboard();
    }
  });

  // History management handlers
  const historyDir = join(app.getPath('userData'), 'history');

  // Ensure history directory exists
  ipcMain.handle('history:ensure-dir', () => {
    try {
      if (!existsSync(historyDir)) {
        mkdirSync(historyDir, { recursive: true });
      }
      return { success: true };
    } catch (error) {
      console.error('Error creating history directory:', error);
      return { success: false, error: String(error) };
    }
  });

  // Save transcription to history
  ipcMain.handle('history:save', (_event, transcription) => {
    try {
      if (!existsSync(historyDir)) {
        mkdirSync(historyDir, { recursive: true });
      }
      const filename = `${Date.now()}.json`;
      const filepath = join(historyDir, filename);
      writeFileSync(filepath, JSON.stringify(transcription, null, 2));
      return { success: true, filename };
    } catch (error) {
      console.error('Error saving transcription:', error);
      return { success: false, error: String(error) };
    }
  });

  // Load all transcriptions from history
  ipcMain.handle('history:load-all', () => {
    try {
      if (!existsSync(historyDir)) {
        return { success: true, transcriptions: [] };
      }
      const files = readdirSync(historyDir).filter(f => f.endsWith('.json'));
      const transcriptions = files.map(file => {
        const content = readFileSync(join(historyDir, file), 'utf-8');
        return JSON.parse(content);
      });
      // Sort by timestamp descending (newest first)
      transcriptions.sort((a, b) => b.timestamp - a.timestamp);
      return { success: true, transcriptions };
    } catch (error) {
      console.error('Error loading transcriptions:', error);
      return { success: false, error: String(error), transcriptions: [] };
    }
  });

  // Theme configuration handlers
  const configDir = join(app.getPath('userData'), 'config');
  const themeConfigPath = join(configDir, 'design-system.json');

  // Load theme configuration
  ipcMain.handle('theme:load', () => {
    try {
      if (!existsSync(themeConfigPath)) {
        return { success: true, theme: null };
      }
      const content = readFileSync(themeConfigPath, 'utf-8');
      const theme = JSON.parse(content);
      return { success: true, theme };
    } catch (error) {
      console.error('Error loading theme:', error);
      return { success: false, error: String(error), theme: null };
    }
  });

  // Save theme configuration
  ipcMain.handle('theme:save', (_event, theme) => {
    try {
      if (!existsSync(configDir)) {
        mkdirSync(configDir, { recursive: true });
      }
      writeFileSync(themeConfigPath, JSON.stringify(theme, null, 2));
      return { success: true };
    } catch (error) {
      console.error('Error saving theme:', error);
      return { success: false, error: String(error) };
    }
  });

  // Reset theme configuration (delete config file)
  ipcMain.handle('theme:reset', () => {
    try {
      if (existsSync(themeConfigPath)) {
        const fs = require('fs');
        fs.unlinkSync(themeConfigPath);
      }
      return { success: true };
    } catch (error) {
      console.error('Error resetting theme:', error);
      return { success: false, error: String(error) };
    }
  });

  createWindow();

  // Enregistrement du raccourci global pour amener l'app au premier plan.
  const shortcutRegistered = globalShortcut.register(
    'CommandOrControl+Shift+X',
    () => {
      console.log('Global shortcut triggered!');
      if (mainWindow) {
        // Restaure la fenêtre si elle est minimisée.
        if (mainWindow.isMinimized()) {
          mainWindow.restore();
        }

        // Forcer la fenêtre sur le bureau courant :
        if (process.platform === 'darwin') {
          // Sur macOS, affichage temporaire sur tous les espaces.
          mainWindow.setVisibleOnAllWorkspaces(true, {
            visibleOnFullScreen: true
          });
          app.dock.show();
        } else {
          // Sur Windows/Linux, mise en "always on top".
          mainWindow.setAlwaysOnTop(true);
        }

        // Met la fenêtre au premier plan et lui donne le focus.
        mainWindow.show();
        mainWindow.focus();

        // Notifie le renderer pour afficher l'interface miniature.
        mainWindow.webContents.send('show-mini-app-hot-key');

        // Rétablit les réglages temporaires après un court délai.
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
    // Sur macOS, recrée la fenêtre si aucune n'est ouverte.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quitte l'application quand toutes les fenêtres sont fermées (sauf sur macOS).
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Désenregistre tous les raccourcis quand l'application quitte.
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// Fonction qui simule le collage du contenu du presse-papier.
function pasteClipboard() {
  if (process.platform === 'darwin') {
    // macOS - using AppleScript
    exec(
      `osascript -e 'tell application "System Events" to keystroke "v" using command down'`,
      error => {
        if (error) {
          console.error('Erreur lors du collage (macOS):', error);
          return;
        }
        console.log('Collage effectué avec succès (macOS)');
      }
    );
  } else if (process.platform === 'win32') {
    // Windows - using PowerShell SendKeys
    exec(
      'powershell -command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait(\'^v\')"',
      error => {
        if (error) {
          console.error('Erreur lors du collage (Windows):', error);
          return;
        }
        console.log('Collage effectué avec succès (Windows)');
      }
    );
  } else if (process.platform === 'linux') {
    // Linux - using xdotool (xclip must be installed)
    exec('xdotool key ctrl+v', error => {
      if (error) {
        console.error('Erreur lors du collage (Linux):', error);
        console.log(
          'Vérifiez que xdotool est installé: sudo apt-get install xdotool'
        );
        return;
      }
      console.log('Collage effectué avec succès (Linux)');
    });
  }
}
