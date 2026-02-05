import { client } from '~/api/client.gen'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  const requestHeaders = import.meta.server ? useRequestHeaders(['cookie']) : undefined

  const getBaseUrl = () => {
    if (!config.public.mockApi) {
      return config.public.apiBaseUrl as string
    }
    if (import.meta.server) {
      const url = useRequestURL()
      return `${url.origin}/api/v1`
    }
    return '/api/v1'
  }

  client.setConfig({ baseUrl: getBaseUrl() })

  client.interceptors.request.use((request) => {
    const token = authStore.token
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`)
    }

    if (requestHeaders?.cookie) {
      request.headers.set('Cookie', requestHeaders.cookie)
    }

    return request
  })
})
