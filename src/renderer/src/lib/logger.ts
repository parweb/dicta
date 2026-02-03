/**
 * Logger utility for renderer process
 * Redirects console.* to electron-log via main process
 */

// Store original console methods
const originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
  debug: console.debug
};

// Format arguments for logging
function formatArgs(args: unknown[]): string {
  return args
    .map((arg) => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    })
    .join(' ');
}

// Check if we're in electron environment with the log API
const hasLogApi = typeof window !== 'undefined' && (window.api as { log?: { debug: (msg: string) => void; info: (msg: string) => void; warn: (msg: string) => void; error: (msg: string) => void } } | undefined)?.log;

if (hasLogApi) {
  // Override console methods to send to main process
  console.log = (...args: unknown[]) => {
    originalConsole.log(...args);
    window.api?.log?.info(formatArgs(args));
  };

  console.info = (...args: unknown[]) => {
    originalConsole.info(...args);
    window.api?.log?.info(formatArgs(args));
  };

  console.warn = (...args: unknown[]) => {
    originalConsole.warn(...args);
    window.api?.log?.warn(formatArgs(args));
  };

  console.error = (...args: unknown[]) => {
    originalConsole.error(...args);
    window.api?.log?.error(formatArgs(args));
  };

  console.debug = (...args: unknown[]) => {
    originalConsole.debug(...args);
    window.api?.log?.debug(formatArgs(args));
  };

  console.log('[LOGGER] Renderer logging initialized');
}

/**
 * Get the log file path
 */
export async function getLogPath(): Promise<string> {
  if (window.api?.log?.getLogPath) {
    return await window.api.log.getLogPath();
  }
  return '';
}

/**
 * Open the log file location
 */
export async function openLogLocation(): Promise<void> {
  const path = await getLogPath();
  if (path && window.api?.send) {
    window.api.send('open-log-location', path);
  }
}
