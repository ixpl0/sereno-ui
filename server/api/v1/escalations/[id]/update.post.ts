import {
  getMockEscalations,
  getMockTenants,
  isValidToken,
  updateMockEscalation,
} from '../../../../utils/mockData'
import { toEscalationResponse } from '../../../../utils/escalationResponse'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')

  if (!isValidToken(token)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      data: { error: { code: 'unauthorized', message: 'Authentication required' } },
    })
  }

  const escalationId = getRouterParam(event, 'id')
  if (!escalationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { error: { code: 'invalid_request', message: 'escalation id is required' } },
    })
  }

  const body = await readBody<{ name?: string, enabled?: boolean }>(event)

  for (const tenant of getMockTenants()) {
    const escalation = getMockEscalations(tenant.id).find(item => item.id === escalationId)
    if (!escalation) {
      continue
    }

    const updatedEscalation = updateMockEscalation(tenant.id, escalationId, {
      name: body.name?.trim() || escalation.name,
      enabled: body.enabled ?? escalation.enabled,
      steps: escalation.steps.map(step => ({
        delay: step.delay,
        member: step.member,
        description: step.description,
        schedule: step.schedule,
      })),
      rules: (escalation.rules ?? []).map(rule => ({
        event: rule.event,
        labels: rule.labels,
        description: rule.description,
      })),
    })

    if (!updatedEscalation) {
      break
    }

    return {
      escalation: toEscalationResponse(updatedEscalation),
    }
  }

  throw createError({
    statusCode: 404,
    statusMessage: 'Not Found',
    data: { error: { code: 'not_found', message: 'escalation not found' } },
  })
})
