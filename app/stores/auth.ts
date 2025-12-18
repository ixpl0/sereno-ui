import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const isAuthenticated = computed(() => token.value !== null)

  const setToken = (newToken: string | null) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('auth_token', newToken)
    }
    else {
      localStorage.removeItem('auth_token')
    }
  }

  const loadToken = () => {
    if (import.meta.client) {
      token.value = localStorage.getItem('auth_token')
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
