import { updateMockEscalation, isValidToken } from '../../../../../utils/mockData'

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

  const query = getQuery(event)
  const escalationId = query.escalation as string
  if (!escalationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { error: { code: 'invalid_request', message: 'escalation id is required' } },
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

  const steps = (body.steps ?? []).map((step: { name?: string, delay: number, member?: string, position?: string, schedule?: string }) => ({
    delay: step.delay,
    member: step.member,
    description: step.name,
    schedule: step.schedule ? { id: step.schedule, position: step.position ?? 'current' } : undefined,
  }))

  const rules = (body.rules ?? []).map((rule: { name?: string, event?: string, labels?: Record<string, string> }) => ({
    description: rule.name,
    event: rule.event,
    labels: rule.labels,
  }))

  const escalation = updateMockEscalation(tenantId, escalationId, {
    name: body.name,
    enabled: body.enabled ?? true,
    steps,
    rules,
  })

  if (!escalation) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      data: { error: { code: 'not_found', message: 'escalation not found' } },
    })
  }

  return { escalation }
})
