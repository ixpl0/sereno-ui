export default defineNuxtRouteMiddleware(() => {
  const event = useRequestEvent()

  let token: string | undefined

  if (import.meta.server && event) {
    const cookies = parseCookies(event)
    token = cookies.auth_token
  }
  else {
    token = useCookie<string | undefined>('auth_token').value
  }

  if (!token) {
    return navigateTo('/auth')
  }
})
