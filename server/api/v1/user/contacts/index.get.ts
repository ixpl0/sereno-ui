import { getMockContacts, isValidToken } from '../../../../utils/mockData'

export default defineEventHandler((event) => {
  const token = getCookie(event, 'auth_token')

  if (!isValidToken(token)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      data: { error: { code: 'unauthorized', message: 'Authentication required' } },
    })
  }

  const contacts = getMockContacts()

  return {
    contacts: contacts.map(c => ({
      id: c.id,
      kind: c.kind,
      value: c.value,
      verified: c.verified,
    })),
  }
})
