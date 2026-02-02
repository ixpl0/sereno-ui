import { createMockSchedule, getMockTenant, isValidToken } from '../../../../../utils/mockData'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')

  if (!isValidToken(token)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      data: { error: { code: 'unauthorized', message: 'Authentication required' } },
    })
  }

  const tenantId = getRouterParam(event, 'id')
  if (!tenantId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { error: { code: 'invalid_request', message: 'tenant id is required' } },
    })
  }

  const body = await readBody(event)
  if (!body.name || body.since === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { error: { code: 'invalid_request', message: 'name and since are required' } },
    })
  }

  const mockSchedule = createMockSchedule(tenantId, {
    name: body.name,
    since: body.since,
    until: body.until,
  })

  const tenant = getMockTenant(tenantId)

  const schedule = {
    id: mockSchedule.id,
    name: mockSchedule.name,
    since: mockSchedule.since,
    until: mockSchedule.until,
    created: mockSchedule.created,
    creator: mockSchedule.creator,
    tenant: { id: tenantId, name: tenant?.name ?? '', role: tenant?.admin ? 'admin' : 'member', since: tenant?.since ?? 0 },
    rotations: [],
    overrides: [],
  }

  return { schedule }
})
