export default defineNuxtRouteMiddleware((to) => {
  const isServer = import.meta.server
  const token = useCookie('auth_token')

  console.log('[auth middleware]', {
    isServer,
    to: to.path,
    hasToken: !!token.value,
    tokenValue: token.value ? `${token.value.slice(0, 10)}...` : null,
  })

  if (isServer) {
    console.log('[auth middleware] skipping on server')
    return
  }

  if (!token.value) {
    console.log('[auth middleware] no token, redirecting to /auth')
    return navigateTo('/auth')
  }

  console.log('[auth middleware] token found, proceeding')
})
