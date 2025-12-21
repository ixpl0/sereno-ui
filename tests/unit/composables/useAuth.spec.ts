import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, computed } from 'vue'
import { getApiData } from '~/utils/api'
import type { ApiResponse, AuthTokenResponse, OAuthRedirectResponse, MessageResponse } from '~/types/api'
import type { OAuthProvider } from '~/types/auth'

const mockToken = ref<string | null>(null)
const mockSetToken = vi.fn((token: string | null) => {
  mockToken.value = token
})
const mockClearToken = vi.fn(() => {
  mockToken.value = null
})

const mockStore = {
  get token() {
    return mockToken.value
  },
  get isAuthenticated() {
    return mockToken.value !== null
  },
  setToken: mockSetToken,
  clearToken: mockClearToken,
}

const mockClientPost = vi.fn()
const mockClientGet = vi.fn()

const mockClient = {
  post: mockClientPost,
  get: mockClientGet,
}

const createUseAuth = () => {
  const isAuthenticated = computed(() => mockStore.isAuthenticated)
  const token = computed(() => mockStore.token)

  const requestEmailCode = async (email: string): Promise<ApiResponse<MessageResponse>> => {
    const response = await mockClient.post({
      url: '/auth/login/email/code',
      body: { email },
    })
    return response as ApiResponse<MessageResponse>
  }

  const loginWithEmail = async (email: string, code: string): Promise<ApiResponse<AuthTokenResponse>> => {
    const response = await mockClient.post({
      url: '/auth/login/email',
      body: { email, code },
    })

    const data = getApiData(response as ApiResponse<AuthTokenResponse>)
    if (data?.access_token) {
      mockStore.setToken(data.access_token)
    }

    return response as ApiResponse<AuthTokenResponse>
  }

  const logout = async (): Promise<ApiResponse<void>> => {
    const response = await mockClient.post({
      url: '/auth/logout',
    })

    mockStore.clearToken()

    return response as ApiResponse<void>
  }

  const refresh = async (): Promise<ApiResponse<AuthTokenResponse>> => {
    const response = await mockClient.post({
      url: '/auth/refresh',
    })

    const data = getApiData(response as ApiResponse<AuthTokenResponse>)
    if (data?.access_token) {
      mockStore.setToken(data.access_token)
    }

    return response as ApiResponse<AuthTokenResponse>
  }

  const getOAuthUrl = async (provider: OAuthProvider): Promise<ApiResponse<OAuthRedirectResponse>> => {
    const response = await mockClient.get({
      url: `/auth/login/${provider}`,
    })
    return response as ApiResponse<OAuthRedirectResponse>
  }

  const handleOAuthCallback = async (
    provider: OAuthProvider,
    params?: Record<string, string>,
  ): Promise<ApiResponse<AuthTokenResponse>> => {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : ''

    const response = await mockClient.get({
      url: `/auth/login/${provider}/callback${queryString}`,
    })

    const data = getApiData(response as ApiResponse<AuthTokenResponse>)
    if (data?.access_token) {
      mockStore.setToken(data.access_token)
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

describe('useAuth', () => {
  beforeEach(() => {
    mockToken.value = null
    mockSetToken.mockClear()
    mockClearToken.mockClear()
    mockClientPost.mockClear()
    mockClientGet.mockClear()
  })

  describe('computed properties', () => {
    it('isAuthenticated returns false when no token', () => {
      const auth = createUseAuth()
      expect(auth.isAuthenticated.value).toBe(false)
    })

    it('isAuthenticated returns true when token exists', () => {
      mockToken.value = 'test-token'
      const auth = createUseAuth()
      expect(auth.isAuthenticated.value).toBe(true)
    })

    it('token reflects current value', () => {
      mockToken.value = 'my-token'
      const auth = createUseAuth()
      expect(auth.token.value).toBe('my-token')
    })
  })

  describe('requestEmailCode', () => {
    it('calls API with email', async () => {
      mockClientPost.mockResolvedValue({ data: { message: 'Code sent' } })
      const auth = createUseAuth()

      const result = await auth.requestEmailCode('test@example.com')

      expect(mockClientPost).toHaveBeenCalledWith({
        url: '/auth/login/email/code',
        body: { email: 'test@example.com' },
      })
      expect(result).toEqual({ data: { message: 'Code sent' } })
    })

    it('returns error response on API failure', async () => {
      mockClientPost.mockResolvedValue({ error: 'Invalid email' })
      const auth = createUseAuth()

      const result = await auth.requestEmailCode('invalid')

      expect(result).toEqual({ error: 'Invalid email' })
    })
  })

  describe('loginWithEmail', () => {
    it('calls API and sets token on success', async () => {
      mockClientPost.mockResolvedValue({ data: { access_token: 'new-token' } })
      const auth = createUseAuth()

      const result = await auth.loginWithEmail('test@example.com', '123456')

      expect(mockClientPost).toHaveBeenCalledWith({
        url: '/auth/login/email',
        body: { email: 'test@example.com', code: '123456' },
      })
      expect(mockSetToken).toHaveBeenCalledWith('new-token')
      expect(result).toEqual({ data: { access_token: 'new-token' } })
    })

    it('does not set token on error', async () => {
      mockClientPost.mockResolvedValue({ error: 'Invalid code' })
      const auth = createUseAuth()

      await auth.loginWithEmail('test@example.com', 'wrong')

      expect(mockSetToken).not.toHaveBeenCalled()
    })

    it('does not set token when access_token is missing', async () => {
      mockClientPost.mockResolvedValue({ data: {} })
      const auth = createUseAuth()

      await auth.loginWithEmail('test@example.com', '123456')

      expect(mockSetToken).not.toHaveBeenCalled()
    })
  })

  describe('logout', () => {
    it('calls API and clears token', async () => {
      mockClientPost.mockResolvedValue({ data: undefined })
      const auth = createUseAuth()

      await auth.logout()

      expect(mockClientPost).toHaveBeenCalledWith({ url: '/auth/logout' })
      expect(mockClearToken).toHaveBeenCalled()
    })

    it('clears token even on API error', async () => {
      mockClientPost.mockResolvedValue({ error: 'Server error' })
      const auth = createUseAuth()

      await auth.logout()

      expect(mockClearToken).toHaveBeenCalled()
    })
  })

  describe('refresh', () => {
    it('calls API and sets new token on success', async () => {
      mockClientPost.mockResolvedValue({ data: { access_token: 'refreshed-token' } })
      const auth = createUseAuth()

      const result = await auth.refresh()

      expect(mockClientPost).toHaveBeenCalledWith({ url: '/auth/refresh' })
      expect(mockSetToken).toHaveBeenCalledWith('refreshed-token')
      expect(result).toEqual({ data: { access_token: 'refreshed-token' } })
    })

    it('does not set token on error', async () => {
      mockClientPost.mockResolvedValue({ error: 'Refresh failed' })
      const auth = createUseAuth()

      await auth.refresh()

      expect(mockSetToken).not.toHaveBeenCalled()
    })
  })

  describe('getOAuthUrl', () => {
    it('calls API with provider', async () => {
      mockClientGet.mockResolvedValue({ data: { redirect_url: 'https://oauth.yandex.ru/auth' } })
      const auth = createUseAuth()

      const result = await auth.getOAuthUrl('yandex')

      expect(mockClientGet).toHaveBeenCalledWith({ url: '/auth/login/yandex' })
      expect(result).toEqual({ data: { redirect_url: 'https://oauth.yandex.ru/auth' } })
    })

    it('handles different providers', async () => {
      mockClientGet.mockResolvedValue({ data: { redirect_url: 'https://id.vk.com/auth' } })
      const auth = createUseAuth()

      await auth.getOAuthUrl('vk')

      expect(mockClientGet).toHaveBeenCalledWith({ url: '/auth/login/vk' })
    })
  })

  describe('handleOAuthCallback', () => {
    it('calls API with provider and params', async () => {
      mockClientGet.mockResolvedValue({ data: { access_token: 'oauth-token' } })
      const auth = createUseAuth()

      const result = await auth.handleOAuthCallback('yandex', { code: 'abc123', state: 'xyz' })

      expect(mockClientGet).toHaveBeenCalledWith({
        url: '/auth/login/yandex/callback?code=abc123&state=xyz',
      })
      expect(mockSetToken).toHaveBeenCalledWith('oauth-token')
      expect(result).toEqual({ data: { access_token: 'oauth-token' } })
    })

    it('calls API without params when not provided', async () => {
      mockClientGet.mockResolvedValue({ data: { access_token: 'oauth-token' } })
      const auth = createUseAuth()

      await auth.handleOAuthCallback('vk')

      expect(mockClientGet).toHaveBeenCalledWith({
        url: '/auth/login/vk/callback',
      })
    })

    it('handles empty params object', async () => {
      mockClientGet.mockResolvedValue({ data: { access_token: 'oauth-token' } })
      const auth = createUseAuth()

      await auth.handleOAuthCallback('keycloak', {})

      expect(mockClientGet).toHaveBeenCalledWith({
        url: '/auth/login/keycloak/callback?',
      })
    })

    it('does not set token on error', async () => {
      mockClientGet.mockResolvedValue({ error: 'OAuth failed' })
      const auth = createUseAuth()

      await auth.handleOAuthCallback('yandex', { code: 'invalid' })

      expect(mockSetToken).not.toHaveBeenCalled()
    })

    it('URL encodes special characters in params', async () => {
      mockClientGet.mockResolvedValue({ data: { access_token: 'token' } })
      const auth = createUseAuth()

      await auth.handleOAuthCallback('yandex', { code: 'abc=123&test' })

      expect(mockClientGet).toHaveBeenCalledWith({
        url: '/auth/login/yandex/callback?code=abc%3D123%26test',
      })
    })
  })
})
