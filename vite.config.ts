import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { copyFileSync, mkdirSync, existsSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: 'src/app',

  plugins: [
    vue(),
    {
      name: 'copy-zendesk-assets',
      closeBundle() {
        const distDir = resolve(__dirname, 'dist')
        const assetsDir = resolve(distDir, 'assets')

        // Ensure directories exist
        if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true })
        if (!existsSync(resolve(distDir, 'translations'))) {
          mkdirSync(resolve(distDir, 'translations'), { recursive: true })
        }

        // Copy manifest.json
        copyFileSync(
          resolve(__dirname, 'src/manifest.json'),
          resolve(distDir, 'manifest.json')
        )

        // Copy translations
        copyFileSync(
          resolve(__dirname, 'src/translations/de.json'),
          resolve(distDir, 'translations/de.json')
        )
        copyFileSync(
          resolve(__dirname, 'src/translations/en.json'),
          resolve(distDir, 'translations/en.json')
        )

        // Copy logos
        copyFileSync(
          resolve(__dirname, 'src/assets/logo.png'),
          resolve(assetsDir, 'logo.png')
        )
        copyFileSync(
          resolve(__dirname, 'src/assets/logo-small.png'),
          resolve(assetsDir, 'logo-small.png')
        )
        copyFileSync(
          resolve(__dirname, 'src/assets/logo.svg'),
          resolve(assetsDir, 'logo.svg')
        )

        // Copy screenshots
        copyFileSync(
          resolve(__dirname, 'src/assets/screenshot-0.png'),
          resolve(assetsDir, 'screenshot-0.png')
        )
        copyFileSync(
          resolve(__dirname, 'src/assets/screenshot-1.png'),
          resolve(assetsDir, 'screenshot-1.png')
        )
        copyFileSync(
          resolve(__dirname, 'src/assets/screenshot-2.png'),
          resolve(assetsDir, 'screenshot-2.png')
        )

        copyFileSync(
          resolve(__dirname, 'src/assets/screenshot-3.png'),
          resolve(assetsDir, 'screenshot-3.png')
        )
        console.log('Zendesk assets copied to dist/')
      }
    }
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/app'),
      '@assets': resolve(__dirname, 'src/assets'),
    },
  },

  base: './',

  build: {
    outDir: '../../dist/assets',
    emptyOutDir: true,

    rollupOptions: {
      output: {
        entryFileNames: 'js/main.js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'css/style.css'
          }
          return '[name][extname]'
        },
      },
    },
  },

  server: {
    port: 4567,
    strictPort: true,
  },
})
