import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Las peticiones a /api se envían a la API local (servidor Express)
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
