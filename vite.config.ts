import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      // Expose environment variables to the client
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
      __APP_ENV__: JSON.stringify(env.VITE_APP_ENV || 'development'),
    },
    build: {
      // Generate source maps for debugging
      sourcemap: mode === 'development',
      // Optimize build for production
      minify: mode === 'production',
      // Split chunks for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            supabase: ['@supabase/supabase-js', '@supabase/auth-helpers-react'],
            ui: ['lucide-react', 'framer-motion'],
          },
        },
      },
    },
    server: {
      // Development server configuration
      port: 5173,
      host: true,
      // Enable CORS for development
      cors: true,
    },
  };
});
