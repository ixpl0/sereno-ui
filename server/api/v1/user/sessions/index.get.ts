import { getMockSessions, isValidToken } from '../../../../utils/mockData'

export default defineEventHandler((event) => {
  const token = getCookie(event, 'auth_token')

  if (!isValidToken(token)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      data: { error: { code: 'unauthorized', message: 'Authentication required' } },
    })
  }

  const sessions = getMockSessions()

  return {
    sessions: sessions.map(s => ({
      id: s.id,
      device: s.device,
      since: s.since,
      current: s.current,
    })),
  }
})
