import { http, HttpResponse } from 'msw'
import type {
  TenantCreateTokenHandlerRequestBody,
  TenantDeleteTokenHandlerRequestBody,
} from '~/api/types.gen'
import { withDelay } from '~/mocks/utils/delay'
import { createErrorResponse } from '~/mocks/utils/error'
import {
  isAuthenticated,
  getTenantById,
  getTenantTokens,
  addTenantToken,
  removeTenantToken,
} from '~/mocks/db'
import { createTenantToken } from '~/mocks/factories/tenant'

const BASE_URL = 'http://localhost:8080/api/v1'

export const tokensHandlers = [
  http.get<{ id: string }>(
    `${BASE_URL}/tenants/:id/tokens`,
    async ({ params }) => {
      await withDelay('realistic')

      if (!isAuthenticated()) {
        return createErrorResponse('unauthorized')
      }

      const tenant = getTenantById(params.id)

      if (!tenant) {
        return createErrorResponse('notFound', 'Tenant not found')
      }

      const tokens = getTenantTokens(params.id)
      return HttpResponse.json({ tokens }, { status: 200 })
    },
  ),

  http.post<{ id: string }, TenantCreateTokenHandlerRequestBody>(
    `${BASE_URL}/tenants/:id/tokens/create`,
    async ({ params, request }) => {
      await withDelay('realistic')

      if (!isAuthenticated()) {
        return createErrorResponse('unauthorized')
      }

      const tenant = getTenantById(params.id)

      if (!tenant) {
        return createErrorResponse('notFound', 'Tenant not found')
      }

      const body = await request.json()

      if (!body.name || body.name.length < 1) {
        return createErrorResponse('badRequest', 'Token name is required')
      }

      const newToken = createTenantToken({ name: body.name })
      addTenantToken(params.id, newToken)

      return HttpResponse.json({ token: newToken }, { status: 200 })
    },
  ),

  http.post<{ id: string }, TenantDeleteTokenHandlerRequestBody>(
    `${BASE_URL}/tenants/:id/tokens/delete`,
    async ({ params, request }) => {
      await withDelay('realistic')

      if (!isAuthenticated()) {
        return createErrorResponse('unauthorized')
      }

      const tenant = getTenantById(params.id)

      if (!tenant) {
        return createErrorResponse('notFound', 'Tenant not found')
      }

      const body = await request.json()

      if (!body.id) {
        return createErrorResponse('badRequest', 'Token ID is required')
      }

      const removed = removeTenantToken(params.id, body.id)

      if (!removed) {
        return createErrorResponse('notFound', 'Token not found')
      }

      return HttpResponse.json({ success: true }, { status: 200 })
    },
  ),
]
