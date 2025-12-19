import { http, HttpResponse } from 'msw'
import type {
  UserEmailLoginHandlerRequestBody,
  UserRequestEmailCodeHandlerRequestBody,
} from '~/api/types.gen'
import { withDelay } from '~/mocks/utils/delay'
import { createErrorResponse } from '~/mocks/utils/error'
import { setAuthToken } from '~/mocks/db'
import { MOCK_API_BASE_URL, MOCK_VERIFICATION_CODES, MOCK_OAUTH_PROVIDERS } from '~/mocks/utils/constants'

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

      if (!MOCK_OAUTH_PROVIDERS.includes(params.provider as typeof MOCK_OAUTH_PROVIDERS[number])) {
        return createErrorResponse('badRequest', `Unknown provider: ${params.provider}`)
      }

      return HttpResponse.json(
        { redirect_url: `https://oauth.example.com/${params.provider}/authorize` },
        { status: 200 },
      )
    },
  ),

  http.get<{ provider: string }>(
    `${MOCK_API_BASE_URL}/auth/login/:provider/callback`,
    async ({ params }) => {
      await withDelay('realistic')

      if (!MOCK_OAUTH_PROVIDERS.includes(params.provider as typeof MOCK_OAUTH_PROVIDERS[number])) {
        return createErrorResponse('badRequest', `Unknown provider: ${params.provider}`)
      }

      const token = `mock-jwt-oauth-${crypto.randomUUID()}`
      setAuthToken(token)

      return HttpResponse.json(
        { access_token: token },
        { status: 200 },
      )
    },
  ),
]
