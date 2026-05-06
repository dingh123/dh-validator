import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      'dh-validator': fileURLToPath(new URL('../src/index.ts', import.meta.url)),
    },
  },
  server: {
    port: 5174,
    open: true,
  },
})
