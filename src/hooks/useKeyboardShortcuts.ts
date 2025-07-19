import { useEffect } from 'react';

interface KeyboardShortcuts {
  onQuickLog?: () => void;
  onStartTimer?: () => void;
  onToggleSearch?: () => void;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const { ctrlKey, metaKey, key, shiftKey } = event;
      const isModifierPressed = ctrlKey || metaKey;

      // Ctrl/Cmd + L: Quick Log
      if (isModifierPressed && key.toLowerCase() === 'l' && shortcuts.onQuickLog) {
        event.preventDefault();
        shortcuts.onQuickLog();
      }

      // Ctrl/Cmd + T: Start Timer
      if (isModifierPressed && key.toLowerCase() === 't' && shortcuts.onStartTimer) {
        event.preventDefault();
        shortcuts.onStartTimer();
      }

      // Ctrl/Cmd + K: Toggle Search
      if (isModifierPressed && key.toLowerCase() === 'k' && shortcuts.onToggleSearch) {
        event.preventDefault();
        shortcuts.onToggleSearch();
      }

      // Quick number shortcuts for common actions
      if (isModifierPressed && shiftKey) {
        switch (key) {
          case '1':
            // Quick log with "Meeting" preset
            event.preventDefault();
            if (shortcuts.onQuickLog) shortcuts.onQuickLog();
            break;
          case '2':
            // Quick log with "Coding" preset
            event.preventDefault();
            if (shortcuts.onQuickLog) shortcuts.onQuickLog();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

export default useKeyboardShortcuts;