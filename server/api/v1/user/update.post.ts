import { updateMockUser, isValidToken } from '../../../utils/mockData'

interface UpdateBody {
  kind: 'first_name' | 'last_name' | 'timezone' | 'language'
  value: string
}

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')

  if (!isValidToken(token)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      data: { error: { code: 'unauthorized', message: 'Authentication required' } },
    })
  }

  const body = await readBody<UpdateBody>(event)

  if (!body.kind || !body.value) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { error: { code: 'bad_request', message: 'Kind and value are required' } },
    })
  }

  const updates: Record<string, string> = {}

  if (body.kind === 'first_name') {
    updates.firstName = body.value
  }
  else if (body.kind === 'last_name') {
    updates.lastName = body.value
  }
  else if (body.kind === 'timezone') {
    updates.timezone = body.value
  }
  else if (body.kind === 'language') {
    updates.language = body.value
  }
  else {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { error: { code: 'bad_request', message: 'Invalid parameter kind' } },
    })
  }

  const user = updateMockUser(updates)

  return {
    id: user.id,
    first_name: user.firstName,
    last_name: user.lastName,
    timezone: user.timezone,
    language: user.language,
  }
})
