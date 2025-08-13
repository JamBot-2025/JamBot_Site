import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    setupFiles: './src/setupTests.ts',
    environment: 'jsdom',
    // Exclude defaults + specific files you don't want to run
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      'src/components/PrivacyPolicy.test.tsx',
      'src/components/TermsOfService.test.tsx',
    ],
    coverage: {
      reporter: ['text', 'html'],
      // Only include app src and pure edge helpers; exclude Deno edge indexes and configs
      include: [
        'src/**/*',
        'supabase/functions/**/lib.ts',
      ],
      exclude: [
        '**/node_modules/**',
        'supabase/functions/**/index.ts',
        'vite.config.ts',
        'postcss.config.js',
        'tailwind.config.js',
        'src/index.tsx',
        'src/supabaseClient.ts',
        'src/components/PrivacyPolicy.tsx',
        'src/components/TermsOfService.tsx',
      ],
      all: true,
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },
})
