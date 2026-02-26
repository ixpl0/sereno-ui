import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({

  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@pinia/nuxt',
  ],

  devtools: { enabled: true },
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  content: {
    database: {
      type: 'sqlite',
      filename: ':memory:',
    },
  },
  runtimeConfig: {
    public: {
      mockApi: false,
      apiBaseUrl: 'http://localhost:8080/api/v1',
      allowedRedirectHosts: ['oauth.example.com', 'oauth.yandex.ru', 'oauth.vk.com', 'id.vk.com'],
    },
  },
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2025-07-15',

  vite: {
    plugins: [tailwindcss()],
    build: {
      sourcemap: false,
    },
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

  icon: {
    mode: 'svg',
    clientBundle: {
      scan: true,
    },
    serverBundle: {
      collections: ['lucide', 'heroicons'],
    },
  },
})
