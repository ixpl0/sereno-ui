import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(() => {
  const store = useAuthStore()

  store.loadToken()

  if (store.isAuthenticated) {
    return navigateTo('/')
  }
})
