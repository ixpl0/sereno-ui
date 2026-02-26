import {
  postAuthLoginEmailCode,
  postAuthLoginEmail,
  postAuthLogout,
  postAuthRefresh,
  getAuthLoginByProvider,
  getAuthLoginByProviderCallback,
} from '~/api/sdk.gen'
import type { UserResponseAccessJwt } from '~/api/types.gen'
import type { OAuthRedirectResponse } from '~/types/api'
import type { OAuthProvider } from '~/types/auth'
import { useAuthStore } from '~/stores/auth'

interface OAuthUrlResponse {
  data: OAuthRedirectResponse | undefined
  error: unknown
}

interface OAuthCallbackResponse {
  data: UserResponseAccessJwt | undefined
  error: unknown
}

export const useAuth = () => {
  const store = useAuthStore()

  const isAuthenticated = computed(() => store.isAuthenticated)
  const token = computed(() => store.token)

  const requestEmailCode = async (email: string) => {
    return postAuthLoginEmailCode({ body: { email } })
  }

  const loginWithEmail = async (email: string, code: string) => {
    const response = await postAuthLoginEmail({ body: { email, code } })

    if (response.data?.token) {
      store.setToken(response.data.token)
    }

    return response
  }

  const logout = async () => {
    const response = await postAuthLogout()
    store.clearToken()
    await clearNuxtData('user')
    return response
  }

  const refresh = async () => {
    const response = await postAuthRefresh()

    if (response.data?.token) {
      store.setToken(response.data.token)
    }

    return response
  }

  const getOAuthUrl = async (provider: OAuthProvider): Promise<OAuthUrlResponse> => {
    const response = await getAuthLoginByProvider({ path: { provider } })
    return response as OAuthUrlResponse
  }

  const handleOAuthCallback = async (
    provider: OAuthProvider,
    params?: Record<string, string>,
  ): Promise<OAuthCallbackResponse> => {
    const response = await getAuthLoginByProviderCallback({
      path: { provider },
      query: params,
    } as Parameters<typeof getAuthLoginByProviderCallback>[0])

    const typedResponse = response as OAuthCallbackResponse
    if (typedResponse.data?.token) {
      store.setToken(typedResponse.data.token)
    }

    return typedResponse
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
