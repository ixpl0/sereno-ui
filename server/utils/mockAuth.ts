export const MOCK_VERIFICATION_CODE = '12345678'

export const MOCK_OAUTH_PROVIDERS = ['yandex', 'vk', 'keycloak'] as const

export type MockOAuthProvider = typeof MOCK_OAUTH_PROVIDERS[number]

export interface MockOAuthUser {
  id: string
  email: string
  name: string
}

export const MOCK_OAUTH_USERS: Record<MockOAuthProvider, MockOAuthUser> = {
  yandex: { id: 'yandex-1', email: 'user@yandex.ru', name: 'Иван Яндексов' },
  vk: { id: 'vk-1', email: 'user@vk.com', name: 'Пётр Вконтактов' },
  keycloak: { id: 'kc-1', email: 'user@company.com', name: 'Корпоративный Пользователь' },
}

export const generateMockToken = (): string => {
  const randomPart = Math.random().toString(36).substring(2, 15)
  return `mock-jwt-${randomPart}-${Date.now()}`
}

export const isValidProvider = (provider: string): provider is MockOAuthProvider => {
  return MOCK_OAUTH_PROVIDERS.includes(provider as MockOAuthProvider)
}
