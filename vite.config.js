import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves this project from /compass-dashboard/, so production
// assets need that prefix. Local dev stays at the root.
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/compass-dashboard/' : '/',
  server: { port: 5180 },
}))
