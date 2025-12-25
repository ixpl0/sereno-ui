import {
  isValidProvider,
  generateMockToken,
  MOCK_OAUTH_USERS,
} from '../../../../../utils/mockAuth'
import { updateMockUser } from '../../../../../utils/mockData'

export default defineEventHandler((event) => {
  const provider = getRouterParam(event, 'provider')

  if (!provider || !isValidProvider(provider)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { error: { code: 'bad_request', message: `Unknown provider: ${provider}` } },
    })
  }

  const query = getQuery(event)
  const scenario = query.scenario as string | undefined

  if (scenario === 'cancel') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { error: { code: 'cancelled', message: 'User cancelled authorization' } },
    })
  }

  if (scenario === 'error') {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: { error: { code: 'oauth_error', message: 'OAuth provider returned an error' } },
    })
  }

  const token = generateMockToken()

  const oauthUser = MOCK_OAUTH_USERS[provider][0]
  if (oauthUser) {
    const nameParts = oauthUser.name.split(' ')
    updateMockUser({
      id: oauthUser.id,
      firstName: nameParts[0] ?? '',
      lastName: nameParts[1] ?? '',
    })
  }

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
