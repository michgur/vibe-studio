import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import monaco from 'vite-plugin-monaco-editor'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
        }
      }
    }),
    monaco.default({
      languageWorkers: ['json'],
      globalAPI: false,
    })
  ],
  root: "client",
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5432',
        changeOrigin: true,
      },
    },
  },
})
