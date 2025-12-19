export const MOCK_API_BASE_URL = 'http://localhost:8080/api/v1'

export const MOCK_VERIFICATION_CODES = {
  email: '12345678',
  contact: '123456',
} as const

export const MOCK_OAUTH_PROVIDERS = ['yandex', 'vk', 'keycloak'] as const

export type MockOAuthProvider = typeof MOCK_OAUTH_PROVIDERS[number]
