import { useEffect, useRef } from 'react';

export interface UseKeyboardShortcutsParams {
  isRecording: boolean;
  isHistoryOpen: boolean;
  currentView: 'home' | 'statistics' | 'settings';
  startRecording: () => void;
  stopRecording: () => void;
  onNavigate: (direction: 'next' | 'previous') => void;
}

export function useKeyboardShortcuts({
  isRecording,
  isHistoryOpen,
  currentView,
  startRecording,
  stopRecording,
  onNavigate
}: UseKeyboardShortcutsParams): void {
  const cKeyIsDown = useRef(false);

  // Global hot key handler (Cmd/Ctrl+Shift+X)
  useEffect(() => {
    const handler = () => {
      startRecording();
    };

    window.api?.on('show-mini-app-hot-key', handler);
    return () => {
      window.api?.removeListener('show-mini-app-hot-key', handler);
    };
  }, [startRecording]);

  // Local keyboard shortcut handler (C key)
  useEffect(() => {
    const controller = new AbortController();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'c' && !cKeyIsDown.current) {
        cKeyIsDown.current = true;
        startRecording();
      }
    };

    const handleKeyUp = () => {
      if (isRecording) {
        cKeyIsDown.current = false;
        stopRecording();
      }
    };

    document.addEventListener('keydown', handleKeyDown, {
      signal: controller.signal
    });
    document.addEventListener('keyup', handleKeyUp, {
      signal: controller.signal
    });

    return () => {
      controller.abort();
    };
  }, [isRecording, startRecording, stopRecording]);

  // Arrow key navigation (Up/Down)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only on home view, not recording, and not in an input
      if (
        currentView !== 'home' ||
        isRecording ||
        isHistoryOpen ||
        (e.target as HTMLElement).tagName === 'INPUT' ||
        (e.target as HTMLElement).tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        onNavigate('next'); // Up = future = more recent
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        onNavigate('previous'); // Down = past = older
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, isRecording, isHistoryOpen, onNavigate]);
}
