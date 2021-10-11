import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { minifyHtml } from 'vite-plugin-html'
import license from 'rollup-plugin-license'
import copy from 'rollup-plugin-copy'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), minifyHtml()],
  build: {
    rollupOptions: {
      plugins: [
        copy({
          targets: [
            {
              src: './assets/fonts/fira-code-ofl.txt',
              dest: '../assets/engine-dist/assets'
            },
            {
              src: './assets/fonts/literata-ofl.txt',
              dest: '../assets/engine-dist/assets'
            }
          ]
        }),
        license({
          banner: `@license <%= pkg.name %> <%= pkg.version %> :: <%= moment().format('YYYY-MM-DD') %>\nCopyright (c) Elm Story Games LLC. All rights reserved.\nSee vendor.*.js for additional 3rd party copyright notices.`
        })
      ]
    },
    manifest: true,
    minify: true,
    outDir: '../assets/engine-dist'
  }
})
