import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' 

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    '__API_URL__': JSON.stringify("https://spark-dating-api.up.railway.app")
  },
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@assets': '/src/assets',
      '@api': '/src/api',
      '@contexts': '/src/contexts',
      '@pages': '/src/pages'
    },
  }
})
