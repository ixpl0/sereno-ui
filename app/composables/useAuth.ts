import { client } from '~/api/client.gen'
import type {
  UserEmailLoginHandlerRequestBody,
  UserRequestEmailCodeHandlerRequestBody,
} from '~/api/types.gen'

const API_BASE = 'http://localhost:8080/api/v1'

export const useAuth = () => {
  const requestEmailCode = async (email: string) => {
    const body: UserRequestEmailCodeHandlerRequestBody = { email }
    const response = await client.post({
      url: `${API_BASE}/auth/login/email/code`,
      body,
    })
    return response
  }

  const loginWithEmail = async (email: string, code: string) => {
    const body: UserEmailLoginHandlerRequestBody = { email, code }
    const response = await client.post({
      url: `${API_BASE}/auth/login/email`,
      body,
    })
    return response
  }

  const logout = async () => {
    const response = await client.post({
      url: `${API_BASE}/auth/logout`,
    })
    return response
  }

  const refresh = async () => {
    const response = await client.post({
      url: `${API_BASE}/auth/refresh`,
    })
    return response
  }

  const getOAuthUrl = async (provider: 'yandex' | 'vk' | 'keycloak') => {
    const response = await client.get({
      url: `${API_BASE}/auth/login/${provider}`,
    })
    return response
  }

  const handleOAuthCallback = async (provider: 'yandex' | 'vk' | 'keycloak') => {
    const response = await client.get({
      url: `${API_BASE}/auth/login/${provider}/callback`,
    })
    return response
  }

  return {
    requestEmailCode,
    loginWithEmail,
    logout,
    refresh,
    getOAuthUrl,
    handleOAuthCallback,
  }
}
