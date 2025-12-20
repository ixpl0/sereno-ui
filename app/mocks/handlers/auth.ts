import { http, HttpResponse } from 'msw'
import type {
  UserEmailLoginHandlerRequestBody,
  UserRequestEmailCodeHandlerRequestBody,
} from '~/api/types.gen'
import { withDelay } from '~/mocks/utils/delay'
import { createErrorResponse } from '~/mocks/utils/error'
import { setAuthToken, setCurrentUserFromOAuth } from '~/mocks/db'
import {
  MOCK_API_BASE_URL,
  MOCK_VERIFICATION_CODES,
  MOCK_OAUTH_PROVIDERS,
  MOCK_OAUTH_USERS,
  type MockOAuthScenario,
} from '~/mocks/utils/constants'

const getMockOAuthRedirectUrl = (provider: string): string => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  return `${baseUrl}/mock-oauth/${provider}`
}

export const authHandlers = [
  http.post<never, UserRequestEmailCodeHandlerRequestBody>(
    `${MOCK_API_BASE_URL}/auth/login/email/code`,
    async ({ request }) => {
      await withDelay('realistic')

      const body = await request.json()

      if (!body.email || !body.email.includes('@')) {
        return createErrorResponse('badRequest', 'Invalid email format')
      }

      return HttpResponse.json(
        { message: 'Code sent to email' },
        { status: 201 },
      )
    },
  ),

  http.post<never, UserEmailLoginHandlerRequestBody>(
    `${MOCK_API_BASE_URL}/auth/login/email`,
    async ({ request }) => {
      await withDelay('realistic')

      const body = await request.json()

      if (!body.email || !body.code) {
        return createErrorResponse('badRequest', 'Email and code are required')
      }

      if (body.code !== MOCK_VERIFICATION_CODES.email) {
        return createErrorResponse('badRequest', 'Invalid verification code')
      }

      const token = `mock-jwt-${crypto.randomUUID()}`
      setAuthToken(token)

      return HttpResponse.json(
        { access_token: token },
        { status: 200 },
      )
    },
  ),

  http.post(`${MOCK_API_BASE_URL}/auth/logout`, async () => {
    await withDelay('fast')
    setAuthToken(null)
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(`${MOCK_API_BASE_URL}/auth/refresh`, async () => {
    await withDelay('fast')

    const newToken = `mock-jwt-${crypto.randomUUID()}`
    setAuthToken(newToken)

    return HttpResponse.json(
      { access_token: newToken },
      { status: 200 },
    )
  }),

  http.get<{ provider: string }>(
    `${MOCK_API_BASE_URL}/auth/login/:provider`,
    async ({ params }) => {
      await withDelay('fast')

      const providerKey = params.provider as typeof MOCK_OAUTH_PROVIDERS[number]
      if (!MOCK_OAUTH_PROVIDERS.includes(providerKey)) {
        return createErrorResponse('badRequest', `Unknown provider: ${params.provider}`)
      }

      return HttpResponse.json(
        { redirect_url: getMockOAuthRedirectUrl(params.provider) },
        { status: 200 },
      )
    },
  ),

  http.get<{ provider: string }>(
    `${MOCK_API_BASE_URL}/auth/login/:provider/callback`,
    async ({ params, request }) => {
      await withDelay('realistic')

      const providerKey = params.provider as typeof MOCK_OAUTH_PROVIDERS[number]
      if (!MOCK_OAUTH_PROVIDERS.includes(providerKey)) {
        return createErrorResponse('badRequest', `Unknown provider: ${params.provider}`)
      }

      const url = new URL(request.url)
      const scenario = url.searchParams.get('scenario') as MockOAuthScenario | null
      const userId = url.searchParams.get('user_id')
      const email = url.searchParams.get('email')
      const name = url.searchParams.get('name')

      if (scenario === 'cancel') {
        return createErrorResponse('badRequest', 'User cancelled authorization')
      }

      if (scenario === 'error') {
        return createErrorResponse('serverError', 'OAuth provider returned an error')
      }

      if (scenario === 'timeout') {
        await withDelay('slow')
        await withDelay('slow')
        return createErrorResponse('serverError', 'Request timed out')
      }

      const token = `mock-jwt-oauth-${providerKey}-${crypto.randomUUID()}`
      setAuthToken(token)

      if (userId && email && name) {
        setCurrentUserFromOAuth({
          id: userId,
          email,
          name,
          provider: providerKey,
        })
      }
      else {
        const defaultUser = MOCK_OAUTH_USERS[providerKey][0]
        if (defaultUser) {
          setCurrentUserFromOAuth({
            id: defaultUser.id,
            email: defaultUser.email,
            name: defaultUser.name,
            provider: providerKey,
          })
        }
      }

      return HttpResponse.json(
        { access_token: token },
        { status: 200 },
      )
    },
  ),
]
