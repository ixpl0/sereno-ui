import { addMockContact, isValidToken } from '../../../../utils/mockData'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')

  if (!isValidToken(token)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      data: { error: { code: 'unauthorized', message: 'Authentication required' } },
    })
  }

  const body = await readBody<{ kind?: string, value?: string }>(event)

  if (!body.kind || !body.value) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { error: { code: 'invalid_request', message: 'kind and value are required' } },
    })
  }

  if (body.kind !== 'email' && body.kind !== 'telegram') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { error: { code: 'invalid_kind', message: 'kind must be email or telegram' } },
    })
  }

  const contact = addMockContact(body.kind, body.value)

  setResponseStatus(event, 201)

  return {
    contact: {
      id: contact.id,
      kind: contact.kind,
      value: contact.value,
      verified: contact.verified,
    },
  }
})
