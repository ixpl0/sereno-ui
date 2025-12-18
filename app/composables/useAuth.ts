import { client } from '~/api/client.gen'
import type {
  UserEmailLoginHandlerRequestBody,
  UserRequestEmailCodeHandlerRequestBody,
} from '~/api/types.gen'
import { useAuthStore } from '~/stores/auth'

export const useAuth = () => {
  const store = useAuthStore()

  const requestEmailCode = async (email: string) => {
    const body: UserRequestEmailCodeHandlerRequestBody = { email }
    const response = await client.post({
      url: '/auth/login/email/code',
      body,
    })
    return response
  }

  const loginWithEmail = async (email: string, code: string) => {
    const body: UserEmailLoginHandlerRequestBody = { email, code }
    const response = await client.post({
      url: '/auth/login/email',
      body,
    })

    if ('data' in response && response.data) {
      const accessToken = (response.data as { access_token?: string }).access_token
      if (accessToken) {
        store.setToken(accessToken)
      }
    }

    return response
  }

  const logout = async () => {
    const response = await client.post({
      url: '/auth/logout',
    })

    store.clearToken()

    return response
  }

  const refresh = async () => {
    const response = await client.post({
      url: '/auth/refresh',
    })

    if ('data' in response && response.data) {
      const accessToken = (response.data as { access_token?: string }).access_token
      if (accessToken) {
        store.setToken(accessToken)
      }
    }

    return response
  }

  const getOAuthUrl = async (provider: 'yandex' | 'vk' | 'keycloak') => {
    const response = await client.get({
      url: `/auth/login/${provider}`,
    })
    return response
  }

  const handleOAuthCallback = async (provider: 'yandex' | 'vk' | 'keycloak') => {
    const response = await client.get({
      url: `/auth/login/${provider}/callback`,
    })

    if ('data' in response && response.data) {
      const accessToken = (response.data as { access_token?: string }).access_token
      if (accessToken) {
        store.setToken(accessToken)
      }
    }

    return response
  }

  return {
    store,
    requestEmailCode,
    loginWithEmail,
    logout,
    refresh,
    getOAuthUrl,
    handleOAuthCallback,
  }
}
