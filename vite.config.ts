import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Fix: Cast process to any to avoid TS error about missing cwd() property on Process type
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Prioritize process.env.API_KEY (Netlify system env) over .env file
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY || env.API_KEY),
      // Polyfill for some legacy libs
      'global': 'window' 
    }
  };
});