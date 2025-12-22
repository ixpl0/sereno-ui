import { http, HttpResponse } from 'msw'
import type {
  TenantRequestName,
  TenantRequestIdRole,
  TenantRequestId,
} from '~/api/types.gen'
import { withDelay } from '~/mocks/utils/delay'
import { createErrorResponse } from '~/mocks/utils/error'
import {
  isAuthenticated,
  getTenants,
  getTenantById,
  addTenant,
  getTenantMembers,
  updateTenantMember,
  removeTenantMember,
} from '~/mocks/db'
import { createTenant } from '~/mocks/factories/tenant'

const BASE_URL = 'http://localhost:8080/api/v1'

export const tenantsHandlers = [
  http.get(`${BASE_URL}/tenants`, async () => {
    await withDelay('realistic')

    if (!isAuthenticated()) {
      return createErrorResponse('unauthorized')
    }

    const tenants = getTenants()
    return HttpResponse.json({ tenants }, { status: 200 })
  }),

  http.get<{ id: string }>(
    `${BASE_URL}/tenants/:id`,
    async ({ params }) => {
      await withDelay('fast')

      if (!isAuthenticated()) {
        return createErrorResponse('unauthorized')
      }

      const tenant = getTenantById(params.id)

      if (!tenant) {
        return createErrorResponse('notFound', 'Tenant not found')
      }

      return HttpResponse.json({ tenant }, { status: 200 })
    },
  ),

  http.post<never, TenantRequestName>(
    `${BASE_URL}/tenants/create`,
    async ({ request }) => {
      await withDelay('realistic')

      if (!isAuthenticated()) {
        return createErrorResponse('unauthorized')
      }

      const body = await request.json()

      if (!body.name || body.name.length < 1 || body.name.length > 64) {
        return createErrorResponse('badRequest', 'Name must be 1-64 characters')
      }

      const newTenant = createTenant({ name: body.name, role: 'admin' })
      addTenant(newTenant)

      return HttpResponse.json({ tenant: newTenant }, { status: 201 })
    },
  ),

  http.post<{ id: string }>(
    `${BASE_URL}/tenants/:id/update`,
    async () => {
      await withDelay('fast')
      return HttpResponse.json(
        { error: 'Not implemented' },
        { status: 501 },
      )
    },
  ),

  http.post<{ id: string }>(
    `${BASE_URL}/tenants/:id/delete`,
    async () => {
      await withDelay('fast')
      return HttpResponse.json(
        { error: 'Not implemented' },
        { status: 501 },
      )
    },
  ),

  http.get<{ id: string }>(
    `${BASE_URL}/tenants/:id/members`,
    async ({ params }) => {
      await withDelay('realistic')

      if (!isAuthenticated()) {
        return createErrorResponse('unauthorized')
      }

      const tenant = getTenantById(params.id)

      if (!tenant) {
        return createErrorResponse('notFound', 'Tenant not found')
      }

      const members = getTenantMembers(params.id)
      return HttpResponse.json({ members }, { status: 200 })
    },
  ),

  http.post<{ id: string }, TenantRequestIdRole>(
    `${BASE_URL}/tenants/:id/members/update`,
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

      if (!body.id || !body.role) {
        return createErrorResponse('badRequest', 'Member ID and role are required')
      }

      const updated = updateTenantMember(params.id, body.id, body.role)

      if (!updated) {
        return createErrorResponse('notFound', 'Member not found')
      }

      return HttpResponse.json({ member: updated }, { status: 200 })
    },
  ),

  http.post<{ id: string }, TenantRequestId>(
    `${BASE_URL}/tenants/:id/members/delete`,
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
        return createErrorResponse('badRequest', 'Member ID is required')
      }

      const removed = removeTenantMember(params.id, body.id)

      if (!removed) {
        return createErrorResponse('notFound', 'Member not found')
      }

      return HttpResponse.json({ success: true }, { status: 200 })
    },
  ),
]
