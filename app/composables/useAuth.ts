import { client } from '~/api/client.gen'
import type {
  UserEmailLoginHandlerRequestBody,
  UserRequestEmailCodeHandlerRequestBody,
} from '~/api/types.gen'
import type { ApiResponse, AuthTokenResponse, OAuthRedirectResponse, MessageResponse } from '~/types/api'
import type { OAuthProvider } from '~/types/auth'
import { useAuthStore } from '~/stores/auth'
import { getApiData } from '~/utils/api'

export const useAuth = () => {
  const store = useAuthStore()

  const isAuthenticated = computed(() => store.isAuthenticated)
  const token = computed(() => store.token)

  const requestEmailCode = async (email: string): Promise<ApiResponse<MessageResponse>> => {
    const body: UserRequestEmailCodeHandlerRequestBody = { email }
    const response = await client.post({
      url: '/auth/login/email/code',
      body,
    })
    return response as ApiResponse<MessageResponse>
  }

  const loginWithEmail = async (email: string, code: string): Promise<ApiResponse<AuthTokenResponse>> => {
    const body: UserEmailLoginHandlerRequestBody = { email, code }
    const response = await client.post({
      url: '/auth/login/email',
      body,
    })

    const data = getApiData(response as ApiResponse<AuthTokenResponse>)
    if (data?.access_token) {
      store.setToken(data.access_token)
    }

    return response as ApiResponse<AuthTokenResponse>
  }

  const logout = async (): Promise<ApiResponse<void>> => {
    const response = await client.post({
      url: '/auth/logout',
    })

    store.clearToken()

    return response as ApiResponse<void>
  }

  const refresh = async (): Promise<ApiResponse<AuthTokenResponse>> => {
    const response = await client.post({
      url: '/auth/refresh',
    })

    const data = getApiData(response as ApiResponse<AuthTokenResponse>)
    if (data?.access_token) {
      store.setToken(data.access_token)
    }

    return response as ApiResponse<AuthTokenResponse>
  }

  const getOAuthUrl = async (provider: OAuthProvider): Promise<ApiResponse<OAuthRedirectResponse>> => {
    const response = await client.get({
      url: `/auth/login/${provider}`,
    })
    return response as ApiResponse<OAuthRedirectResponse>
  }

  const handleOAuthCallback = async (provider: OAuthProvider): Promise<ApiResponse<AuthTokenResponse>> => {
    const response = await client.get({
      url: `/auth/login/${provider}/callback`,
    })

    const data = getApiData(response as ApiResponse<AuthTokenResponse>)
    if (data?.access_token) {
      store.setToken(data.access_token)
    }

    return response as ApiResponse<AuthTokenResponse>
  }

  return {
    isAuthenticated,
    token,
    requestEmailCode,
    loginWithEmail,
    logout,
    refresh,
    getOAuthUrl,
    handleOAuthCallback,
  }
}
