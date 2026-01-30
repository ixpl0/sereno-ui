import { deleteMockOverride, isValidToken } from '../../../../../utils/mockData'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')

  if (!isValidToken(token)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      data: { error: { code: 'unauthorized', message: 'Authentication required' } },
    })
  }

  const scheduleId = getRouterParam(event, 'id')
  if (!scheduleId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { error: { code: 'invalid_request', message: 'schedule id is required' } },
    })
  }

  const body = await readBody(event)
  if (body.number === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { error: { code: 'invalid_request', message: 'override number is required' } },
    })
  }

  const schedule = deleteMockOverride(scheduleId, body.number)
  if (!schedule) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      data: { error: { code: 'not_found', message: 'schedule or override not found' } },
    })
  }

  return { success: true }
})
