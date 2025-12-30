import { updateMockTenant, isValidToken } from '../../../../utils/mockData'

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

  const body = await readBody<{ name?: string }>(event)

  if (!body.name || body.name.trim().length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { error: { code: 'invalid_request', message: 'name is required' } },
    })
  }

  const tenant = updateMockTenant(tenantId, body.name.trim())

  if (!tenant) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      data: { error: { code: 'not_found', message: 'Tenant not found' } },
    })
  }

  setResponseStatus(event, 201)

  return { tenant }
})
