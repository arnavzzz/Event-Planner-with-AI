import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        timeout: 30000,
        configure: (proxy) => {
          proxy.on('error', (err, _req, res) => {
            // Gracefully handle gateway connection error instead of breaking Vite
            if (res && 'writeHead' in res && !res.headersSent) {
              res.writeHead(502, { 'Content-Type': 'application/json' });
              res.end(
                JSON.stringify({
                  detail:
                    'Backend service on http://127.0.0.1:8000 is temporarily unreachable. Client will fallback automatically.',
                  code: 'GATEWAY_ERROR',
                  error: err.message,
                })
              );
            }
          });
        },
      },
    },
  },
})
