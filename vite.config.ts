import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative base: the same build works at a GitHub Pages repo sub-path,
  // at a domain root, or on any other static host.
  base: './',
  plugins: [react()],
})
