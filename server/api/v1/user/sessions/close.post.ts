import { closeOtherMockSessions, isValidToken } from '../../../../utils/mockData'

export default defineEventHandler((event) => {
  const token = getCookie(event, 'auth_token')

  if (!isValidToken(token)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      data: { error: { code: 'unauthorized', message: 'Authentication required' } },
    })
  }

  closeOtherMockSessions()

  setResponseStatus(event, 204)
  return null
})
