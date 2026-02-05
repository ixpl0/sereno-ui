import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

const nuxtImportMeta = (): import('vite').Plugin => ({
  name: 'nuxt-import-meta',
  transform(code: string, id: string) {
    if (id.includes('node_modules')) {
      return null
    }
    if (!code.includes('import.meta.client') && !code.includes('import.meta.server')) {
      return null
    }
    return code
      .replace(/import\.meta\.client/g, 'true')
      .replace(/import\.meta\.server/g, 'false')
  },
})

export default defineConfig({
  plugins: [vue(), nuxtImportMeta()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/unit/**/*.spec.ts'],
    exclude: ['node_modules', 'dist', '.nuxt', 'tests/e2e'],
    setupFiles: ['./tests/unit/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '.nuxt/',
        'app/api/',
        'dist/',
        '**/*.stories.ts',
        '**/*.d.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./app', import.meta.url)),
      '@': fileURLToPath(new URL('./app', import.meta.url)),
    },
  },
})
