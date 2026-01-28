import { createMockEscalation, isValidToken } from '../../../../../utils/mockData'

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
  if (!body.name || !body.steps) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { error: { code: 'invalid_request', message: 'name and steps are required' } },
    })
  }

  const escalation = createMockEscalation(tenantId, {
    name: body.name,
    enabled: body.enabled ?? true,
    steps: body.steps,
    rules: body.rules,
  })

  return { escalation }
})
