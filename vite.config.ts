import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, host: true },
  preview: {
    host: true,
    // Render will pass PORT via the start script; we don't hardcode it here
    allowedHosts: ['hrinterviewtracker.onrender.com']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
