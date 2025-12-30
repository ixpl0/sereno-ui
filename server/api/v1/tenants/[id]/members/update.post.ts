import { updateMockTenantMember, isValidToken } from '../../../../../utils/mockData'

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

  const body = await readBody<{ id?: string, admin?: boolean }>(event)

  if (!body.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { error: { code: 'invalid_request', message: 'member id is required' } },
    })
  }

  const member = updateMockTenantMember(tenantId, body.id, body.admin ?? false)

  if (!member) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      data: { error: { code: 'not_found', message: 'Member not found' } },
    })
  }

  return { member }
})
