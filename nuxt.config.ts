import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({

  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@pinia/nuxt',
  ],

  devtools: { enabled: true },

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
    },
  },
  routeRules: {
    '/': { prerender: true },
    '/about': { prerender: true },
    '/pricing': { prerender: true },
    '/blog': { prerender: true },
    '/blog/**': { prerender: true },
    '/docs': { prerender: true },
    '/docs/**': { prerender: true },
  },

  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2025-07-15',

  nitro: {
    prerender: {
      routes: ['/', '/about', '/pricing', '/blog', '/docs'],
      crawlLinks: true,
      ignore: [
        (route: string) => {
          const allowed = ['/', '/about', '/pricing', '/blog', '/docs']
          return !allowed.some(prefix =>
            route === prefix || route.startsWith(`${prefix}/`),
          )
        },
      ],
    },
  },

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
