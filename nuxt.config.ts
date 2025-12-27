import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({

  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    '@pinia/nuxt',
  ],

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      mockApi: false,
    },
  },

  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2025-07-15',

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ['@iconify/vue'],
    },
  },

  typescript: {
    strict: true,
    typeCheck: process.env.NUXT_TYPE_CHECK !== 'false',
  },

  eslint: {
    config: {
      standalone: true,
      stylistic: true,
    },
  },
})
