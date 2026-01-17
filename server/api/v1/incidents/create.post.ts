import { createMockIncident, isValidToken } from '../../../utils/mockData'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')

  if (!isValidToken(token)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      data: { error: { code: 'unauthorized', message: 'Authentication required' } },
    })
  }

  const body = await readBody<{ tenant: { id: string }, title: string, description?: string }>(event)

  if (!body.tenant?.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { error: { code: 'bad_request', message: 'Tenant ID is required' } },
    })
  }

  if (!body.title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { error: { code: 'bad_request', message: 'Title is required' } },
    })
  }

  const incident = createMockIncident(body.tenant.id, body.title, body.description)

  return incident
})
