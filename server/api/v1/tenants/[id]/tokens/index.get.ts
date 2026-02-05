import { getMockTenantTokens, isValidToken } from '../../../../../utils/mockData'

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

  const rawTokens = getMockTenantTokens(tenantId)
  const tokens = rawTokens.map(t => ({
    id: t.id,
    name: t.name,
    created: t.since,
    creator: 'mock-user',
  }))

  return { tokens }
})
