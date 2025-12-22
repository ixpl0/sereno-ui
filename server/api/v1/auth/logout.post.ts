export default defineEventHandler((event) => {
  deleteCookie(event, 'auth_token')

  setResponseStatus(event, 204)
  return null
})
