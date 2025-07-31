import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    setupFiles: './src/setupTests.ts',
    environment: 'jsdom',
    coverage: {
      reporter: ['text', 'html'],
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },
})
