import { getMockSchedule, isValidToken } from '../../../../utils/mockData'

const isActiveAtTimestamp = (since: number, until: number, timestamp: number): boolean =>
  since <= timestamp && until > timestamp

export default defineEventHandler((event) => {
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

  const schedule = getMockSchedule(scheduleId)
  if (!schedule) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      data: { error: { code: 'not_found', message: 'schedule not found' } },
    })
  }

  const query = getQuery(event)
  const targetTimestampRaw = query.timestamp ? Number(query.timestamp) : Math.floor(Date.now() / 1000)
  const roundedTimestamp = Math.floor(targetTimestampRaw / 600) * 600

  const rotationShifts = schedule.rotations.flatMap(rotation =>
    rotation.shifts.filter(shift =>
      isActiveAtTimestamp(shift.since, shift.until, roundedTimestamp),
    ),
  )

  const overrideShifts = schedule.overrides
    .map(override => override.shift)
    .filter(shift => isActiveAtTimestamp(shift.since, shift.until, roundedTimestamp))

  const shifts = [...overrideShifts, ...rotationShifts]

  return { shifts }
})
