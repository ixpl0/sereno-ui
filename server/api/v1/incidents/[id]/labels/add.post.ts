import { addMockIncidentLabel, isValidToken } from '../../../../../utils/mockData'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')

  if (!isValidToken(token)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      data: { error: { code: 'unauthorized', message: 'Authentication required' } },
    })
  }

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { error: { code: 'bad_request', message: 'Incident ID is required' } },
    })
  }

  const body = await readBody<{ key: string, value: string }>(event)

  if (!body.key || !body.value) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { error: { code: 'bad_request', message: 'Label key and value are required' } },
    })
  }

  const incident = addMockIncidentLabel(id, body.key, body.value)

  if (!incident) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      data: { error: { code: 'not_found', message: 'Incident not found' } },
    })
  }

  return { incident }
})
