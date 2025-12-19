import { defineStore } from 'pinia'
import { safeStorage } from '~/utils/storage'

const AUTH_TOKEN_KEY = 'auth_token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const isAuthenticated = computed(() => token.value !== null)

  const setToken = (newToken: string | null) => {
    token.value = newToken
    if (newToken) {
      safeStorage.setItem(AUTH_TOKEN_KEY, newToken)
    }
    else {
      safeStorage.removeItem(AUTH_TOKEN_KEY)
    }
  }

  const loadToken = () => {
    if (import.meta.client) {
      token.value = safeStorage.getItem(AUTH_TOKEN_KEY)
    }
  }

  const clearToken = () => {
    setToken(null)
  }

  return {
    token,
    isAuthenticated,
    setToken,
    loadToken,
    clearToken,
  }
})
