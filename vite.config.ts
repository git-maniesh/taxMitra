
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          // Using 127.0.0.1 instead of localhost to prevent common IPv6 connection timeouts
          target: 'http://127.0.0.1:5000',
          changeOrigin: true,
          secure: false,
          // Stripping /api prefix so server.js doesn't need to repeat it in every route
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});
