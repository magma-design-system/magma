import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@/formats': path.resolve(__dirname, './src/formats'),
      '@/leonardo': path.resolve(__dirname, './src/lib/leonardo'),
    },
  },
  test: {
  },
})
