import { MOCK_VERIFICATION_CODE, generateMockToken } from '../../../../../utils/mockAuth'

interface RequestBody {
  email: string
  code: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<RequestBody>(event)

  if (!body.email || !body.code) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { error: { code: 'bad_request', message: 'Email and code are required' } },
    })
  }

  if (body.code !== MOCK_VERIFICATION_CODE) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { error: { code: 'bad_request', message: 'Invalid verification code' } },
    })
  }

  const token = generateMockToken()

  setCookie(event, 'auth_token', token, {
    httpOnly: false,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return {
    token,
    type: 'bearer',
  }
})
