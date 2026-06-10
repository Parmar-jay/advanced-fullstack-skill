import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy API calls to backend during development
      '/auth': 'http://localhost:8000',
      '/users': 'http://localhost:8000',
      '/items': 'http://localhost:8000',
      '/admin': 'http://localhost:8000',
      '/uploads': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
    },
  },
})
