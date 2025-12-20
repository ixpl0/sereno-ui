export type AuthStep = 'email' | 'code'
export type OAuthProvider = 'yandex' | 'vk' | 'keycloak'

export interface OAuthProviderConfig {
  id: OAuthProvider
  name: string
  icon: string
}
