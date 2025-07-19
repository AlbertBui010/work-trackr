/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0f172a',
        card: '#1e293b',
        accent: '#3b82f6',
        textMain: '#e2e8f0',
        textSecondary: '#94a3b8',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.75rem',
        full: '9999px'
      },
      backgroundColor: {
        'slate-750': '#334155'
      }
    },
  },
  plugins: [],
};