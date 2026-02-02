import { getMockSchedules, getMockTenant, isValidToken } from '../../../../../utils/mockData'

export default defineEventHandler((event) => {
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

  const tenant = getMockTenant(tenantId)
  const mockSchedules = getMockSchedules(tenantId)

  const schedules = mockSchedules.map(s => ({
    id: s.id,
    name: s.name,
    since: s.since,
    until: s.until,
    created: s.created,
    creator: s.creator,
    tenant: { id: tenantId, name: tenant?.name ?? '', role: tenant?.admin ? 'admin' : 'member', since: tenant?.since ?? 0 },
    rotations: s.rotations.map(r => ({
      description: r.description,
      members: r.members,
      created: r.created,
      creator: r.creator,
      shifts: r.shifts,
    })),
    overrides: s.overrides.map(o => ({
      description: o.description,
      created: o.created,
      creator: o.creator,
      shifts: o.shifts,
    })),
  }))

  return { schedules }
})
