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
  if (!body.name || !body.duration || body.since === undefined || !body.members || !body.days) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { error: { code: 'invalid_request', message: 'name, duration, since, members, and days are required' } },
    })
  }

  const schedule = createMockRotation(scheduleId, {
    name: body.name,
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

  const mockRotation = schedule.rotations[schedule.rotations.length - 1]
  if (!mockRotation) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: { error: { code: 'internal_error', message: 'failed to create rotation' } },
    })
  }

  const rotation = {
    name: mockRotation.name,
    number: mockRotation.number,
    members: mockRotation.members,
    created: mockRotation.created,
    creator: mockRotation.creator,
    shifts: mockRotation.shifts,
  }

  return { rotation }
})
