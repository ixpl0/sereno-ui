import { client } from '~/api/client.gen'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const baseUrl = config.public.mockApi
    ? '/api/v1'
    : config.public.apiBaseUrl

  client.setConfig({ baseUrl })
})
