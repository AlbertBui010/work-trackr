import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface AccessibilityContextType {
  announceMessage: (message: string) => void;
  focusElement: (selector: string) => void;
  skipToContent: () => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  reducedMotion: boolean;
  setReducedMotion: (value: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const { t } = useTranslation();
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check for user preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReducedMotion(prefersReducedMotion);

    // Load saved preferences
    const savedHighContrast = localStorage.getItem('worktrackr_high_contrast') === 'true';
    setHighContrast(savedHighContrast);
  }, []);

  useEffect(() => {
    // Apply high contrast mode
    document.documentElement.classList.toggle('high-contrast', highContrast);
    localStorage.setItem('worktrackr_high_contrast', highContrast.toString());
  }, [highContrast]);

  useEffect(() => {
    // Apply reduced motion preference
    document.documentElement.classList.toggle('reduce-motion', reducedMotion);
  }, [reducedMotion]);

  const announceMessage = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  const focusElement = (selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
      announceMessage(t('accessibility.focusedElement', { element: element.tagName }));
    }
  };

  const skipToContent = () => {
    const mainContent = document.querySelector('main') as HTMLElement;
    if (mainContent) {
      mainContent.focus();
      announceMessage(t('accessibility.skipToContent'));
    }
  };

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
    announceMessage(
      highContrast 
        ? t('accessibility.highContrastDisabled')
        : t('accessibility.highContrastEnabled')
    );
  };

  return (
    <AccessibilityContext.Provider value={{
      announceMessage,
      focusElement,
      skipToContent,
      highContrast,
      toggleHighContrast,
      reducedMotion,
      setReducedMotion
    }}>
      {children}
      
      {/* Screen reader announcements */}
      <div id="sr-announcements" className="sr-only" aria-live="polite" aria-atomic="true" />
      
      {/* Skip to content link */}
      <button
        onClick={skipToContent}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50"
      >
        {t('accessibility.skipToContent')}
      </button>
    </AccessibilityContext.Provider>
  );
};