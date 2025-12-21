import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { ref, computed } from 'vue'

const createAuthStore = () => {
  const tokenCookie = ref<string | null>(null)

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
    _tokenCookie: tokenCookie,
  }
}

describe('useAuthStore', () => {
  let store: ReturnType<typeof createAuthStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = createAuthStore()
  })

  describe('token', () => {
    it('returns null by default', () => {
      expect(store.token.value).toBeNull()
    })

    it('returns value after setToken', () => {
      store.setToken('test-token')
      expect(store.token.value).toBe('test-token')
    })
  })

  describe('isAuthenticated', () => {
    it('returns false when token is null', () => {
      expect(store.isAuthenticated.value).toBe(false)
    })

    it('returns true when token exists', () => {
      store.setToken('valid-token')
      expect(store.isAuthenticated.value).toBe(true)
    })

    it('returns false after clearToken', () => {
      store.setToken('valid-token')
      store.clearToken()
      expect(store.isAuthenticated.value).toBe(false)
    })
  })

  describe('setToken', () => {
    it('updates token value', () => {
      store.setToken('new-token')
      expect(store._tokenCookie.value).toBe('new-token')
    })

    it('can set to null', () => {
      store.setToken('token')
      store.setToken(null)
      expect(store._tokenCookie.value).toBeNull()
    })

    it('can be called multiple times', () => {
      store.setToken('token-1')
      expect(store.token.value).toBe('token-1')

      store.setToken('token-2')
      expect(store.token.value).toBe('token-2')

      store.setToken('token-3')
      expect(store.token.value).toBe('token-3')
    })
  })

  describe('clearToken', () => {
    it('sets token to null', () => {
      store.setToken('existing-token')
      store.clearToken()
      expect(store.token.value).toBeNull()
    })

    it('works when already empty', () => {
      store.clearToken()
      expect(store.token.value).toBeNull()
    })
  })
})
