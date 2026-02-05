export type AuthStep = 'email' | 'code'
export type OAuthProvider = 'yandex' | 'vk' | 'keycloak'

const OAUTH_PROVIDERS: ReadonlyArray<OAuthProvider> = ['yandex', 'vk', 'keycloak']

export const isOAuthProvider = (value: string): value is OAuthProvider =>
  OAUTH_PROVIDERS.includes(value as OAuthProvider)

export interface OAuthProviderConfig {
  id: OAuthProvider
  name: string
  icon: string
}
