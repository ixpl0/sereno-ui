import { client } from '~/api/client.gen'
import type {
  UserRequestEmail,
  UserRequestEmailCode,
  UserResponseAccessJwt,
} from '~/api/types.gen'
import type { ApiResponse, OAuthRedirectResponse } from '~/types/api'
import type { OAuthProvider } from '~/types/auth'
import { useAuthStore } from '~/stores/auth'
import { getApiData } from '~/utils/api'

export const useAuth = () => {
  const store = useAuthStore()

  const isAuthenticated = computed(() => store.isAuthenticated)
  const token = computed(() => store.token)

  const requestEmailCode = async (email: string): Promise<ApiResponse<void>> => {
    const body: UserRequestEmail = { email }
    const response = await client.post({
      url: '/auth/login/email/code',
      body,
    })
    return response as ApiResponse<void>
  }

  const loginWithEmail = async (email: string, code: string): Promise<ApiResponse<UserResponseAccessJwt>> => {
    const body: UserRequestEmailCode = { email, code }
    const response = await client.post({
      url: '/auth/login/email',
      body,
    })

    const data = getApiData(response as ApiResponse<UserResponseAccessJwt>)
    if (data?.token) {
      store.setToken(data.token)
    }

    return response as ApiResponse<UserResponseAccessJwt>
  }

  const logout = async (): Promise<ApiResponse<void>> => {
    const response = await client.post({
      url: '/auth/logout',
    })

    store.clearToken()

    return response as ApiResponse<void>
  }

  const refresh = async (): Promise<ApiResponse<UserResponseAccessJwt>> => {
    const response = await client.post({
      url: '/auth/refresh',
    })

    const data = getApiData(response as ApiResponse<UserResponseAccessJwt>)
    if (data?.token) {
      store.setToken(data.token)
    }

    return response as ApiResponse<UserResponseAccessJwt>
  }

  const getOAuthUrl = async (provider: OAuthProvider): Promise<ApiResponse<OAuthRedirectResponse>> => {
    const response = await client.get({
      url: `/auth/login/${provider}`,
    })
    return response as ApiResponse<OAuthRedirectResponse>
  }

  const handleOAuthCallback = async (
    provider: OAuthProvider,
    params?: Record<string, string>,
  ): Promise<ApiResponse<UserResponseAccessJwt>> => {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : ''

    const response = await client.get({
      url: `/auth/login/${provider}/callback${queryString}`,
    })

    const data = getApiData(response as ApiResponse<UserResponseAccessJwt>)
    if (data?.token) {
      store.setToken(data.token)
    }

    return response as ApiResponse<UserResponseAccessJwt>
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
