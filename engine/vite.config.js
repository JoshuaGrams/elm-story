import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { minifyHtml } from 'vite-plugin-html'
import banner from 'vite-plugin-banner'

import pkg from './package.json'

const license = `
/*
  @license ${pkg.name} ${pkg.version}
  Copyright (c) Elm Story Games LLC. All rights reserved.
  Generated: ${Date.now()} | https://elmstory.com
*/
`

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      includeAssets: [
        'favicon.svg',
        'favicon.ico',
        'robots.txt',
        'apple-touch-icon.png',
        'fonts/*.ttf'
      ],
      manifest: {
        name: '___gameTitle___',
        short_name: '___gameTitle___',
        description: '___gameDescription___',
        theme_color: '#080808',
        background_color: '#080808',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    }),
    banner(license),
    minifyHtml({
      removeAttributeQuotes: false
    })
  ],
  build: {
    manifest: true,
    minify: true,
    outDir: '../assets/engine-dist'
  }
})
