export default defineNuxtRouteMiddleware(() => {
  const token = useCookie<string | null>('auth_token', {
    default: () => null,
    sameSite: 'lax',
  })

  if (!token.value) {
    return navigateTo('/auth')
  }
})
