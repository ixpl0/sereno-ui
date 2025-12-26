import { verifyMockContact, isValidToken } from '../../../../../utils/mockData'

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
      data: { error: { code: 'invalid_request', message: 'Contact ID is required' } },
    })
  }

  const body = await readBody<{ code?: string }>(event)

  if (!body.code) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { error: { code: 'invalid_request', message: 'Verification code is required' } },
    })
  }

  const contact = verifyMockContact(id, body.code)

  if (!contact) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { error: { code: 'invalid_code', message: 'Invalid verification code' } },
    })
  }

  return {
    contact: {
      id: contact.id,
      kind: contact.kind,
      value: contact.value,
      verified: contact.verified,
    },
  }
})
