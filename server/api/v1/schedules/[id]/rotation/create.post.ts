import { createMockRotation, isValidToken } from '../../../../../utils/mockData'

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
  if (!body.description || !body.duration || body.since === undefined || !body.members || !body.days) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { error: { code: 'invalid_request', message: 'description, duration, since, members, and days are required' } },
    })
  }

  const schedule = createMockRotation(scheduleId, {
    description: body.description,
    duration: body.duration,
    since: body.since,
    members: body.members,
    days: body.days,
  })

  if (!schedule) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      data: { error: { code: 'not_found', message: 'schedule not found' } },
    })
  }

  const rotation = schedule.rotations[schedule.rotations.length - 1]

  return { rotation }
})
