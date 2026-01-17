import { defineStore } from 'pinia'

const AUTH_TOKEN_KEY = 'auth_token'

export const useAuthStore = defineStore('auth', () => {
  const tokenCookie = useCookie<string | null>(AUTH_TOKEN_KEY, {
    default: () => null,
    watch: true,
    sameSite: 'lax',
  })

  const token = computed(() => tokenCookie.value)
  const isAuthenticated = computed(() => token.value !== null)

  const setToken = (newToken: string | null) => {
    tokenCookie.value = newToken
  }

  const clearToken = () => {
    setToken(null)
  }

  return {
    token,
    isAuthenticated,
    setToken,
    clearToken,
  }
})
