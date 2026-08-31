import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { traeBadgePlugin } from 'vite-plugin-trae-solo-badge';

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => {
  const server: import('vite').UserConfig['server'] = {
    host: '0.0.0.0',
    port: 4173,
  };
  const isDev = command === 'serve' && !isPreview && process.argv.slice(2).every(a => !['preview','--preview'].includes(a));
  if (isDev) {
    server.proxy = {
      '/vl': {
        target: 'http://127.0.0.1:5173',
        changeOrigin: true,
        ws: true,
      },
    };
  }
  return {
    server,
    preview: {
      host: '0.0.0.0',
      port: 4173,
    },
    build: {
      sourcemap: 'hidden',
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
    },
    plugins: [
      react({
        babel: {
          plugins: [
            'react-dev-locator',
          ],
        },
      }),
      traeBadgePlugin({
        variant: 'dark',
        position: 'bottom-right',
        prodOnly: true,
        clickable: true,
        clickUrl: 'https://www.trae.ai/solo?showJoin=1',
        autoTheme: true,
        autoThemeTarget: '#root'
      }),
      tsconfigPaths()
    ],
  };
})
