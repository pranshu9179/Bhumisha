import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          if (
            ['react', 'react-dom', 'react-router-dom', 'react-redux', '@reduxjs/toolkit'].some((pkg) =>
              id.includes(`/node_modules/${pkg}/`) || id.includes(`\\node_modules\\${pkg}\\`),
            )
          ) {
            return 'react-vendor'
          }

          if (
            ['@tanstack/react-query', '@tanstack/react-table', 'axios', 'axios-mock-adapter', 'react-hook-form', '@hookform/resolvers', 'zod'].some(
              (pkg) => id.includes(`/node_modules/${pkg}/`) || id.includes(`\\node_modules\\${pkg}\\`),
            )
          ) {
            return 'data-vendor'
          }

          if (
            [
              '@radix-ui/react-avatar',
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-scroll-area',
              '@radix-ui/react-select',
              '@radix-ui/react-separator',
              '@radix-ui/react-slot',
              '@radix-ui/react-tabs',
              'lucide-react',
            ].some((pkg) => id.includes(`/node_modules/${pkg}/`) || id.includes(`\\node_modules\\${pkg}\\`))
          ) {
            return 'ui-vendor'
          }

          if (
            ['recharts', 'framer-motion'].some(
              (pkg) => id.includes(`/node_modules/${pkg}/`) || id.includes(`\\node_modules\\${pkg}\\`),
            )
          ) {
            return 'charts-vendor'
          }

          return 'vendor'
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/tests/setup.js',
    css: true,
  },
})
