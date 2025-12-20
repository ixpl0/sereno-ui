export const MOCK_API_BASE_URL = 'http://localhost:8080/api/v1'

export const MOCK_VERIFICATION_CODES = {
  email: '12345678',
  contact: '123456',
} as const

export const MOCK_OAUTH_PROVIDERS = ['yandex', 'vk', 'keycloak'] as const

export type MockOAuthProvider = typeof MOCK_OAUTH_PROVIDERS[number]

export const MOCK_OAUTH_SCENARIOS = ['success', 'cancel', 'error', 'timeout'] as const

export type MockOAuthScenario = typeof MOCK_OAUTH_SCENARIOS[number]

export interface MockOAuthUser {
  id: string
  email: string
  name: string
  avatar?: string
}

export const MOCK_OAUTH_USERS: Record<MockOAuthProvider, ReadonlyArray<MockOAuthUser>> = {
  yandex: [
    { id: 'yandex-1', email: 'user@yandex.ru', name: 'Иван Яндексов', avatar: 'https://avatars.yandex.net/get-yapic/0/0-0/islands-200' },
    { id: 'yandex-2', email: 'admin@yandex.ru', name: 'Админ Яндексов' },
  ],
  vk: [
    { id: 'vk-1', email: 'user@vk.com', name: 'Пётр Вконтактов' },
    { id: 'vk-2', email: 'test@vk.com', name: 'Тест Тестов' },
  ],
  keycloak: [
    { id: 'kc-1', email: 'user@company.com', name: 'Корпоративный Пользователь' },
    { id: 'kc-admin', email: 'admin@company.com', name: 'Корпоративный Админ' },
  ],
}

export const MOCK_OAUTH_PROVIDER_CONFIG: Record<MockOAuthProvider, { name: string, color: string, icon: string }> = {
  yandex: { name: 'Яндекс', color: '#FC3F1D', icon: 'tabler:brand-yandex' },
  vk: { name: 'ВКонтакте', color: '#0077FF', icon: 'simple-icons:vk' },
  keycloak: { name: 'Keycloak', color: '#4D4D4D', icon: 'simple-icons:keycloak' },
}
