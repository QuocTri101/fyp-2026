import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In development the browser talks to Vite (http://localhost:5173) and Vite
// forwards /api/* to the API Gateway. That avoids CORS problems and the
// "untrusted HTTPS certificate" warning for https://localhost:5003.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://localhost:5003',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
