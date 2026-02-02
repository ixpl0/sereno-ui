import { createMockOverride, isValidToken } from '../../../../../utils/mockData'

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
  if (!body.description || !body.duration || body.since === undefined || !body.member) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { error: { code: 'invalid_request', message: 'description, duration, since, and member are required' } },
    })
  }

  const schedule = createMockOverride(scheduleId, {
    description: body.description,
    duration: body.duration,
    since: body.since,
    member: body.member,
  })

  if (!schedule) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      data: { error: { code: 'not_found', message: 'schedule not found' } },
    })
  }

  const mockOverride = schedule.overrides[schedule.overrides.length - 1]
  if (!mockOverride) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: { error: { code: 'internal_error', message: 'failed to create override' } },
    })
  }

  const rotation = {
    description: mockOverride.description,
    created: mockOverride.created,
    creator: mockOverride.creator,
    shifts: mockOverride.shifts,
  }

  return { rotation }
})
