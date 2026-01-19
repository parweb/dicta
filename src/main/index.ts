import { electronApp, is, optimizer } from '@electron-toolkit/utils';
import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  safeStorage,
  shell
} from 'electron';
import { autoUpdater } from 'electron-updater';
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

// Auto-updater configuration
let updateCheckInterval: NodeJS.Timeout | null = null;
const UPDATE_CHECK_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
const INITIAL_CHECK_DELAY = 5 * 60 * 1000; // 5 minutes after startup

// Configure autoUpdater
autoUpdater.autoDownload = true; // Download automatically when update is available
autoUpdater.autoInstallOnAppQuit = true; // Install on next quit
autoUpdater.logger = console;

// Update channel management
const getUpdateConfigPath = () => join(app.getPath('userData'), 'config', 'update.json');

function loadUpdateChannel(): 'stable' | 'beta' {
  try {
    const updateConfigPath = getUpdateConfigPath();
    if (existsSync(updateConfigPath)) {
      const content = readFileSync(updateConfigPath, 'utf-8');
      const config = JSON.parse(content);
      return config.channel === 'beta' ? 'beta' : 'stable';
    }
  } catch (error) {
    console.error('[AUTO-UPDATE] Error loading update channel:', error);
  }
  return 'stable'; // Default to stable
}

function saveUpdateChannel(channel: 'stable' | 'beta'): boolean {
  try {
    const configDir = join(app.getPath('userData'), 'config');
    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true });
    }
    const updateConfigPath = getUpdateConfigPath();
    const config = {
      channel,
      lastCheck: Date.now()
    };
    writeFileSync(updateConfigPath, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('[AUTO-UPDATE] Error saving update channel:', error);
    return false;
  }
}

// Set initial channel
const currentChannel = loadUpdateChannel();
// Map our channel names to electron-updater channel names
// stable -> latest (electron-builder generates latest-mac.yml by default)
// beta -> beta
const electronUpdaterChannel = currentChannel === 'stable' ? 'latest' : 'beta';
autoUpdater.channel = electronUpdaterChannel;
console.log('[AUTO-UPDATE] Update channel set to:', currentChannel, '(electron-updater channel:', electronUpdaterChannel + ')');

// Auto-updater event handlers
autoUpdater.on('checking-for-update', () => {
  console.log('[AUTO-UPDATE] Checking for update...');
  if (mainWindow) {
    mainWindow.webContents.send('update:status', {
      status: 'checking',
      message: 'Recherche de mises à jour...'
    });
  }
});

autoUpdater.on('update-available', (info) => {
  console.log('[AUTO-UPDATE] Update available:', info.version);
  if (mainWindow) {
    mainWindow.webContents.send('update:status', {
      status: 'downloading',
      message: `Téléchargement v${info.version}...`,
      version: info.version
    });
  }
});

autoUpdater.on('update-not-available', (info) => {
  console.log('[AUTO-UPDATE] Update not available. Current version:', info.version);
  if (mainWindow) {
    mainWindow.webContents.send('update:status', {
      status: 'up-to-date',
      message: 'Application à jour',
      version: info.version
    });
  }
});

autoUpdater.on('download-progress', (progressObj) => {
  const logMessage = `[AUTO-UPDATE] Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}%`;
  console.log(logMessage);
  if (mainWindow) {
    mainWindow.webContents.send('update:progress', {
      percent: Math.round(progressObj.percent),
      bytesPerSecond: progressObj.bytesPerSecond,
      transferred: progressObj.transferred,
      total: progressObj.total
    });
  }
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('[AUTO-UPDATE] Update downloaded:', info.version);
  if (mainWindow) {
    mainWindow.webContents.send('update:status', {
      status: 'ready',
      message: `v${info.version} s'installera au redémarrage`,
      version: info.version
    });
  }
});

autoUpdater.on('error', (err) => {
  console.error('[AUTO-UPDATE] Error:', err);
  if (mainWindow) {
    mainWindow.webContents.send('update:status', {
      status: 'error',
      message: 'Erreur de mise à jour',
      error: err.message
    });
  }
});

// Function to check for updates
function checkForUpdates() {
  if (!is.dev) {
    // Only check for updates in production
    console.log('[AUTO-UPDATE] Starting update check...');
    autoUpdater.checkForUpdates().catch(err => {
      console.error('[AUTO-UPDATE] Error checking for updates:', err);
    });
  } else {
    console.log('[AUTO-UPDATE] Skipping update check in development mode');
  }
}

// Schedule periodic update checks
function startUpdateSchedule() {
  // Check 5 minutes after startup
  console.log('[AUTO-UPDATE] Scheduling initial update check in 5 minutes...');
  setTimeout(() => {
    checkForUpdates();
  }, INITIAL_CHECK_DELAY);

  // Then check every 4 hours
  updateCheckInterval = setInterval(() => {
    checkForUpdates();
  }, UPDATE_CHECK_INTERVAL);
}

// Clean up interval on app quit
function stopUpdateSchedule() {
  if (updateCheckInterval) {
    clearInterval(updateCheckInterval);
    updateCheckInterval = null;
  }
}

function createWindow(): void {
  console.log('[DICTA] Creating window...');
  try {
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

    console.log('[DICTA] Window created successfully');

    mainWindow.on('ready-to-show', () => {
      console.log('[DICTA] Window ready to show');
      mainWindow?.show();
    });

    // Configure session to inject Origin header for CORS proxies
    // Force localhost origin for both dev and prod to satisfy CORS proxy requirements
    mainWindow.webContents.session.webRequest.onBeforeSendHeaders(
      { urls: ['https://proxy.corsfix.com/*', 'https://corsproxy.io/*'] },
      (details, callback) => {
        console.log('[MAIN] Injecting Origin header for:', details.url);
        details.requestHeaders['Origin'] = 'http://localhost:5173';
        callback({ requestHeaders: details.requestHeaders });
      }
    );

    // Open DevTools with Cmd+Alt+I (even in production for debugging)
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (input.meta && input.alt && input.key.toLowerCase() === 'i') {
        mainWindow?.webContents.toggleDevTools();
        event.preventDefault();
      }
    });

    mainWindow.webContents.setWindowOpenHandler(details => {
      shell.openExternal(details.url);
      return { action: 'deny' };
    });

    // Charge l'URL de développement ou le fichier HTML en production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      console.log(
        '[DICTA] Loading dev URL:',
        process.env['ELECTRON_RENDERER_URL']
      );
      mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
    } else {
      const htmlPath = join(__dirname, '../renderer/index.html');
      console.log('[DICTA] Loading HTML file:', htmlPath);
      mainWindow.loadFile(htmlPath);
    }
  } catch (error) {
    console.error('[DICTA] Error creating window:', error);
    throw error;
  }
}

app.whenReady().then(() => {
  // Définir l'App User Model ID pour Windows.
  electronApp.setAppUserModelId('com.electron');

  console.log('[DICTA] App ready, starting...');
  console.log('[DICTA] is.dev:', is.dev);

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
  const credentialsPath = join(configDir, 'credentials.json');
  const credentialsBedrockPath = join(configDir, 'credentials-bedrock.json');

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

  // Credentials management handlers
  // Check if encryption is available
  ipcMain.handle('credentials:check-encryption-available', () => {
    try {
      return {
        success: true,
        available: safeStorage.isEncryptionAvailable()
      };
    } catch (error) {
      console.error('Error checking encryption availability:', error);
      return {
        success: false,
        available: false,
        error: String(error)
      };
    }
  });

  // Save API key (encrypted)
  ipcMain.handle('credentials:save-api-key', (_event, apiKey: string) => {
    try {
      console.log('[CREDENTIALS] Saving API key, length:', apiKey?.length);
      console.log('[CREDENTIALS] API key starts with:', apiKey?.substring(0, 7));

      if (!existsSync(configDir)) {
        mkdirSync(configDir, { recursive: true });
      }

      // Encrypt the API key
      const isEncryptionAvailable = safeStorage.isEncryptionAvailable();
      console.log('[CREDENTIALS] Encryption available:', isEncryptionAvailable);

      const encrypted = isEncryptionAvailable
        ? safeStorage.encryptString(apiKey)
        : Buffer.from(apiKey, 'utf-8'); // Fallback (warn user in UI)

      console.log('[CREDENTIALS] Encrypted buffer length:', encrypted.length);

      // Store as Base64 string
      const data = {
        encrypted: encrypted.toString('base64'),
        isEncrypted: isEncryptionAvailable,
        timestamp: Date.now()
      };

      writeFileSync(credentialsPath, JSON.stringify(data, null, 2));
      console.log('[CREDENTIALS] API key saved successfully to:', credentialsPath);
      console.log('[CREDENTIALS] Data isEncrypted:', data.isEncrypted);
      return { success: true };
    } catch (error) {
      console.error('[CREDENTIALS] Error saving API key:', error);
      return { success: false, error: String(error) };
    }
  });

  // Load API key (decrypted)
  ipcMain.handle('credentials:load-api-key', () => {
    try {
      console.log('[CREDENTIALS] Loading API key from:', credentialsPath);

      if (!existsSync(credentialsPath)) {
        console.log('[CREDENTIALS] No credentials file found');
        return { success: true, apiKey: null };
      }

      const content = readFileSync(credentialsPath, 'utf-8');
      console.log('[CREDENTIALS] Read credentials file, length:', content.length);

      const data = JSON.parse(content);
      console.log('[CREDENTIALS] Parsed data, isEncrypted:', data.isEncrypted);
      console.log('[CREDENTIALS] Encrypted base64 length:', data.encrypted?.length);

      // Decrypt the API key
      const buffer = Buffer.from(data.encrypted, 'base64');
      console.log('[CREDENTIALS] Buffer from base64, length:', buffer.length);

      const apiKey = data.isEncrypted
        ? safeStorage.decryptString(buffer)
        : buffer.toString('utf-8');

      console.log('[CREDENTIALS] Decrypted API key length:', apiKey?.length);
      console.log('[CREDENTIALS] Decrypted API key starts with:', apiKey?.substring(0, 7));

      return { success: true, apiKey };
    } catch (error) {
      console.error('[CREDENTIALS] Error loading API key:', error);
      return { success: false, error: String(error), apiKey: null };
    }
  });

  // Delete API key
  ipcMain.handle('credentials:delete-api-key', () => {
    try {
      if (existsSync(credentialsPath)) {
        const fs = require('fs');
        fs.unlinkSync(credentialsPath);
        console.log('API key deleted successfully');
      }
      return { success: true };
    } catch (error) {
      console.error('Error deleting API key:', error);
      return { success: false, error: String(error) };
    }
  });

  // Bedrock credentials management handlers
  // Save Bedrock credentials (encrypted)
  ipcMain.handle(
    'credentials:save-bedrock',
    (_event, credentials: { bearerToken: string; region: string; modelId: string }) => {
      try {
        console.log('[BEDROCK-CREDENTIALS] Saving credentials');

        if (!existsSync(configDir)) {
          mkdirSync(configDir, { recursive: true });
        }

        // Encrypt the credentials
        const isEncryptionAvailable = safeStorage.isEncryptionAvailable();
        console.log('[BEDROCK-CREDENTIALS] Encryption available:', isEncryptionAvailable);

        const credentialsString = JSON.stringify(credentials);
        const encrypted = isEncryptionAvailable
          ? safeStorage.encryptString(credentialsString)
          : Buffer.from(credentialsString, 'utf-8');

        // Store as Base64 string
        const data = {
          encrypted: encrypted.toString('base64'),
          isEncrypted: isEncryptionAvailable,
          timestamp: Date.now()
        };

        writeFileSync(credentialsBedrockPath, JSON.stringify(data, null, 2));
        console.log('[BEDROCK-CREDENTIALS] Credentials saved successfully');
        return { success: true };
      } catch (error) {
        console.error('[BEDROCK-CREDENTIALS] Error saving credentials:', error);
        return { success: false, error: String(error) };
      }
    }
  );

  // Load Bedrock credentials (decrypted)
  ipcMain.handle('credentials:load-bedrock', () => {
    try {
      console.log('[BEDROCK-CREDENTIALS] Loading credentials from:', credentialsBedrockPath);

      if (!existsSync(credentialsBedrockPath)) {
        console.log('[BEDROCK-CREDENTIALS] No credentials file found');
        return { success: true, credentials: null };
      }

      const content = readFileSync(credentialsBedrockPath, 'utf-8');
      const data = JSON.parse(content);
      console.log('[BEDROCK-CREDENTIALS] Parsed data, isEncrypted:', data.isEncrypted);

      // Decrypt the credentials
      const buffer = Buffer.from(data.encrypted, 'base64');
      const credentialsString = data.isEncrypted
        ? safeStorage.decryptString(buffer)
        : buffer.toString('utf-8');

      const credentials = JSON.parse(credentialsString);
      console.log('[BEDROCK-CREDENTIALS] Credentials loaded successfully');

      return { success: true, credentials };
    } catch (error) {
      console.error('[BEDROCK-CREDENTIALS] Error loading credentials:', error);
      return { success: false, error: String(error), credentials: null };
    }
  });

  // Delete Bedrock credentials
  ipcMain.handle('credentials:delete-bedrock', () => {
    try {
      if (existsSync(credentialsBedrockPath)) {
        const fs = require('fs');
        fs.unlinkSync(credentialsBedrockPath);
        console.log('[BEDROCK-CREDENTIALS] Credentials deleted successfully');
      }
      return { success: true };
    } catch (error) {
      console.error('[BEDROCK-CREDENTIALS] Error deleting credentials:', error);
      return { success: false, error: String(error) };
    }
  });

  // Bedrock Tools handlers
  // Add event to macOS Calendar via AppleScript
  ipcMain.handle(
    'bedrock:add-to-calendar',
    (
      _event,
      params: {
        title: string;
        startTime: string;
        endTime?: string;
        description?: string;
      }
    ) => {
      try {
        console.log('[BEDROCK-TOOLS] Adding calendar event:', params);

        // Parse ISO dates
        const startDate = new Date(params.startTime);
        const endDate = params.endTime ? new Date(params.endTime) : new Date(startDate.getTime() + 60 * 60 * 1000); // Default: 1 hour later

        // Format dates for AppleScript (e.g., "January 20, 2024 at 2:00:00 PM")
        const formatDateForAppleScript = (date: Date): string => {
          return date.toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          });
        };

        const startDateStr = formatDateForAppleScript(startDate);
        const endDateStr = formatDateForAppleScript(endDate);

        // Escape quotes in strings
        const escapeForAppleScript = (str: string): string => {
          return str.replace(/"/g, '\\"').replace(/\\/g, '\\\\');
        };

        const title = escapeForAppleScript(params.title);
        const description = params.description
          ? escapeForAppleScript(params.description)
          : '';

        // Build AppleScript
        const script = `
tell application "Calendar"
  tell calendar "Calendar"
    set newEvent to make new event with properties {summary:"${title}", start date:date "${startDateStr}", end date:date "${endDateStr}"}
    ${description ? `set description of newEvent to "${description}"` : ''}
  end tell
end tell
`;

        console.log('[BEDROCK-TOOLS] AppleScript:', script);

        // Execute AppleScript
        return new Promise((resolve) => {
          exec(`osascript -e '${script.replace(/'/g, "'\\''")}'`, (error, stdout, stderr) => {
            if (error) {
              console.error('[BEDROCK-TOOLS] AppleScript error:', error);
              console.error('[BEDROCK-TOOLS] stderr:', stderr);
              resolve({
                success: false,
                error: `Failed to create calendar event: ${error.message}`
              });
            } else {
              console.log('[BEDROCK-TOOLS] Calendar event created successfully');
              resolve({
                success: true,
                message: `Created event "${params.title}" from ${startDateStr} to ${endDateStr}`
              });
            }
          });
        });
      } catch (error) {
        console.error('[BEDROCK-TOOLS] Error in add-to-calendar:', error);
        return { success: false, error: String(error) };
      }
    }
  );

  // Save content as markdown note
  ipcMain.handle(
    'bedrock:save-note',
    (_event, params: { title: string; content: string; folder?: string }) => {
      try {
        console.log('[BEDROCK-TOOLS] Saving note:', params.title);

        // Create notes directory
        const notesDir = join(app.getPath('userData'), 'notes');
        if (!existsSync(notesDir)) {
          mkdirSync(notesDir, { recursive: true });
        }

        // Handle optional subfolder
        let targetDir = notesDir;
        if (params.folder) {
          targetDir = join(notesDir, params.folder);
          if (!existsSync(targetDir)) {
            mkdirSync(targetDir, { recursive: true });
          }
        }

        // Create filename: timestamp-slug(title).md
        const timestamp = Date.now();
        const slug = params.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .substring(0, 50);
        const filename = `${timestamp}-${slug}.md`;
        const filepath = join(targetDir, filename);

        // Write markdown file
        writeFileSync(filepath, params.content, 'utf-8');

        console.log('[BEDROCK-TOOLS] Note saved:', filepath);
        return {
          success: true,
          message: `Note saved as ${filename}`,
          filepath
        };
      } catch (error) {
        console.error('[BEDROCK-TOOLS] Error saving note:', error);
        return { success: false, error: String(error) };
      }
    }
  );

  // Send email via mailto: URL
  ipcMain.handle(
    'bedrock:send-email',
    (_event, params: { to?: string; subject: string; body: string }) => {
      try {
        console.log('[BEDROCK-TOOLS] Opening email client:', params.subject);

        // URL encode parameters
        const to = params.to ? encodeURIComponent(params.to) : '';
        const subject = encodeURIComponent(params.subject);
        const body = encodeURIComponent(params.body);

        // Build mailto: URL
        const mailtoUrl = `mailto:${to}?subject=${subject}&body=${body}`;

        // Open in default mail client
        shell.openExternal(mailtoUrl);

        console.log('[BEDROCK-TOOLS] Email client opened');
        return {
          success: true,
          message: 'Email draft created in default mail client'
        };
      } catch (error) {
        console.error('[BEDROCK-TOOLS] Error opening email client:', error);
        return { success: false, error: String(error) };
      }
    }
  );

  // Update management handlers
  ipcMain.handle('update:get-current-version', () => {
    return {
      success: true,
      version: app.getVersion(),
      channel: loadUpdateChannel()
    };
  });

  ipcMain.handle('update:get-channel', () => {
    return {
      success: true,
      channel: loadUpdateChannel()
    };
  });

  ipcMain.handle('update:set-channel', (_event, channel: 'stable' | 'beta') => {
    try {
      const success = saveUpdateChannel(channel);
      if (success) {
        // Map our channel names to electron-updater channel names
        const electronUpdaterChannel = channel === 'stable' ? 'latest' : 'beta';
        autoUpdater.channel = electronUpdaterChannel;
        console.log('[AUTO-UPDATE] Channel changed to:', channel, '(electron-updater channel:', electronUpdaterChannel + ')');
        // Check for updates immediately after channel change
        if (!is.dev) {
          setTimeout(() => checkForUpdates(), 1000);
        }
      }
      return { success };
    } catch (error) {
      console.error('[AUTO-UPDATE] Error setting update channel:', error);
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('update:check-now', () => {
    try {
      if (!is.dev) {
        checkForUpdates();
        return { success: true };
      } else {
        return {
          success: false,
          error: 'Update checks are disabled in development mode'
        };
      }
    } catch (error) {
      console.error('[AUTO-UPDATE] Error checking for updates:', error);
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('update:get-last-check-time', () => {
    try {
      const updateConfigPath = getUpdateConfigPath();
      if (existsSync(updateConfigPath)) {
        const content = readFileSync(updateConfigPath, 'utf-8');
        const config = JSON.parse(content);
        return { success: true, lastCheck: config.lastCheck || null };
      }
      return { success: true, lastCheck: null };
    } catch (error) {
      return { success: false, error: String(error), lastCheck: null };
    }
  });

  createWindow();

  // Start auto-update schedule
  startUpdateSchedule();

  // Enregistrement du raccourci global pour amener l'app au premier plan.
  // Dev: Cmd/Ctrl+Shift+C, Prod: Cmd/Ctrl+Shift+X
  const globalShortcutKey = is.dev ? 'CommandOrControl+Shift+C' : 'CommandOrControl+Shift+X';
  console.log('[DICTA] Registering global shortcut:', globalShortcutKey);

  const shortcutRegistered = globalShortcut.register(
    globalShortcutKey,
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
          if (mainWindow) {
            if (process.platform === 'darwin') {
              mainWindow.setVisibleOnAllWorkspaces(false);
            } else {
              mainWindow.setAlwaysOnTop(false);
            }
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
  stopUpdateSchedule();
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
