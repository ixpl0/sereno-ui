export default defineNuxtRouteMiddleware(() => {
  const token = useCookie<string | undefined>('auth_token')

  if (!token.value) {
    return navigateTo('/auth')
  }
})
