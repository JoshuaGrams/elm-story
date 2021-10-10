import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { minifyHtml } from 'vite-plugin-html'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), minifyHtml()],
  build: {
    manifest: true,
    minify: false,
    outDir: '../assets/engine-dist'
  }
})
