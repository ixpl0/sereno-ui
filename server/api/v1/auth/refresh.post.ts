import { generateMockToken } from '../../../utils/mockAuth'
import { isValidToken } from '../../../utils/mockData'

export default defineEventHandler((event) => {
  const currentToken = getCookie(event, 'auth_token')

  if (!isValidToken(currentToken)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      data: { error: { code: 'unauthorized', message: 'No valid token' } },
    })
  }

  const newToken = generateMockToken()

  setCookie(event, 'auth_token', newToken, {
    httpOnly: false,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return {
    token: newToken,
    type: 'bearer',
  }
})
