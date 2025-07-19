import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { motion } from 'framer-motion';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Load theme from localStorage or default to dark
    const savedTheme = localStorage.getItem('worktrackr_theme') as Theme;
    if (savedTheme) {
      setThemeState(savedTheme);
    }
    
    // Apply theme to document
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, []);

  useEffect(() => {
    // Apply theme changes
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('worktrackr_theme', theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    if (newTheme !== theme) {
      setIsTransitioning(true);
      setThemeState(newTheme);
      
      // Reset transition state after animation
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      <motion.div
        initial={false}
        animate={{ 
          backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
          color: theme === 'dark' ? '#e2e8f0' : '#1e293b'
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`min-h-screen transition-colors duration-300 ${
          isTransitioning ? 'pointer-events-none' : ''
        }`}
      >
        {children}
      </motion.div>
    </ThemeContext.Provider>
  );
};