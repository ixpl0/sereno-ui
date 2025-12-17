import { http, HttpResponse } from 'msw'
import type {
  UserEmailLoginHandlerRequestBody,
  UserRequestEmailCodeHandlerRequestBody,
} from '~/api/types.gen'
import { withDelay } from '~/mocks/utils/delay'
import { createErrorResponse } from '~/mocks/utils/error'
import { setAuthToken } from '~/mocks/db'

const BASE_URL = 'http://localhost:8080/api/v1'
const VALID_CODE = '12345678'

export const authHandlers = [
  http.post<never, UserRequestEmailCodeHandlerRequestBody>(
    `${BASE_URL}/auth/login/email/code`,
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
    `${BASE_URL}/auth/login/email`,
    async ({ request }) => {
      await withDelay('realistic')

      const body = await request.json()

      if (!body.email || !body.code) {
        return createErrorResponse('badRequest', 'Email and code are required')
      }

      if (body.code !== VALID_CODE) {
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

  http.post(`${BASE_URL}/auth/logout`, async () => {
    await withDelay('fast')
    setAuthToken(null)
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(`${BASE_URL}/auth/refresh`, async () => {
    await withDelay('fast')

    const newToken = `mock-jwt-${crypto.randomUUID()}`
    setAuthToken(newToken)

    return HttpResponse.json(
      { access_token: newToken },
      { status: 200 },
    )
  }),

  http.get<{ provider: string }>(
    `${BASE_URL}/auth/login/:provider`,
    async ({ params }) => {
      await withDelay('fast')

      const validProviders = ['yandex', 'vk', 'keycloak']
      if (!validProviders.includes(params.provider)) {
        return createErrorResponse('badRequest', `Unknown provider: ${params.provider}`)
      }

      return HttpResponse.json(
        { redirect_url: `https://oauth.example.com/${params.provider}/authorize` },
        { status: 200 },
      )
    },
  ),

  http.get<{ provider: string }>(
    `${BASE_URL}/auth/login/:provider/callback`,
    async ({ params }) => {
      await withDelay('realistic')

      const validProviders = ['yandex', 'vk', 'keycloak']
      if (!validProviders.includes(params.provider)) {
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
