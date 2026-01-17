export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) {
    return
  }

  const token = useCookie('auth_token')

  if (!token.value) {
    return navigateTo('/auth')
  }
})
