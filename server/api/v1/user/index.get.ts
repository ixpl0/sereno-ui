import { getMockUser, isValidToken } from '../../../utils/mockData'

export default defineEventHandler((event) => {
  const token = getCookie(event, 'auth_token')

  if (!isValidToken(token)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      data: { error: { code: 'unauthorized', message: 'Authentication required' } },
    })
  }

  const user = getMockUser()

  return {
    id: user.id,
    first_name: user.firstName,
    last_name: user.lastName,
    timezone: user.timezone,
    language: user.language,
  }
})
