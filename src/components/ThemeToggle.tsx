import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900"
      aria-label={t('accessibility.toggleTheme')}
      whileTap={{ scale: 0.95 }}
    >
      {/* Toggle background */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 dark:from-blue-600 dark:to-purple-600"
        initial={false}
        animate={{
          opacity: theme === 'dark' ? 1 : 0.8
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Toggle circle */}
      <motion.div
        className="relative w-5 h-5 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center"
        initial={false}
        animate={{
          x: theme === 'dark' ? 12 : -12
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
      >
        <motion.div
          initial={false}
          animate={{
            scale: theme === 'dark' ? 1 : 0,
            rotate: theme === 'dark' ? 0 : 180
          }}
          transition={{ duration: 0.2 }}
        >
          <Moon className="h-3 w-3 text-slate-700" />
        </motion.div>
        
        <motion.div
          className="absolute"
          initial={false}
          animate={{
            scale: theme === 'light' ? 1 : 0,
            rotate: theme === 'light' ? 0 : -180
          }}
          transition={{ duration: 0.2 }}
        >
          <Sun className="h-3 w-3 text-orange-500" />
        </motion.div>
      </motion.div>
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        initial={false}
        animate={{
          boxShadow: theme === 'dark' 
            ? '0 0 20px rgba(59, 130, 246, 0.5)' 
            : '0 0 20px rgba(251, 191, 36, 0.5)'
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
};

export default ThemeToggle;