import { createMockEscalation, isValidToken } from '../../../../../utils/mockData'
import { toEscalationResponse } from '../../../../../utils/escalationResponse'

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

  const body = await readBody<{ name?: string, enabled?: boolean }>(event)
  if (!body.name || body.name.trim() === '') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { error: { code: 'invalid_request', message: 'name is required' } },
    })
  }

  const escalation = createMockEscalation(tenantId, {
    name: body.name.trim(),
    enabled: body.enabled ?? true,
    steps: [],
    rules: [],
  })

  return { escalation: toEscalationResponse(escalation) }
})
