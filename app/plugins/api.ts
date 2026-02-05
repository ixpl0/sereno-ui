import { client } from '~/api/client.gen'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const baseUrl = config.public.mockApi
    ? '/api/v1'
    : config.public.apiBaseUrl

  client.setConfig({ baseUrl })

  client.interceptors.request.use((request) => {
    const token = authStore.token
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`)
    }
    return request
  })
})
