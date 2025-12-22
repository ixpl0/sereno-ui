import { client } from '~/api/client.gen'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  if (config.public.mockApi) {
    client.setConfig({
      baseUrl: '/api/v1',
    })
  }
})
