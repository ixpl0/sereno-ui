import { http, HttpResponse } from 'msw'
import type {
  UserAddContactHandlerRequestBody,
  UserVerifyContactHandlerRequestBody,
} from '~/api/types.gen'
import { withDelay } from '~/mocks/utils/delay'
import { createErrorResponse } from '~/mocks/utils/error'
import {
  isAuthenticated,
  getCurrentUser,
  getContacts,
  addContact,
  updateContact,
  removeContact,
} from '~/mocks/db'
import { createContact } from '~/mocks/factories/user'
import { MOCK_API_BASE_URL, MOCK_VERIFICATION_CODES } from '~/mocks/utils/constants'

export const userHandlers = [
  http.get(`${MOCK_API_BASE_URL}/user`, async () => {
    await withDelay('realistic')

    if (!isAuthenticated()) {
      return createErrorResponse('unauthorized')
    }

    const user = getCurrentUser()
    return HttpResponse.json({ user }, { status: 200 })
  }),

  http.post(`${MOCK_API_BASE_URL}/user/update`, async () => {
    await withDelay('realistic')

    if (!isAuthenticated()) {
      return createErrorResponse('unauthorized')
    }

    return HttpResponse.json(
      { error: 'Not implemented' },
      { status: 501 },
    )
  }),

  http.get(`${MOCK_API_BASE_URL}/user/contacts`, async () => {
    await withDelay('realistic')

    if (!isAuthenticated()) {
      return createErrorResponse('unauthorized')
    }

    const contacts = getContacts()
    return HttpResponse.json({ contacts }, { status: 200 })
  }),

  http.post<never, UserAddContactHandlerRequestBody>(
    `${MOCK_API_BASE_URL}/user/contacts/add`,
    async ({ request }) => {
      await withDelay('realistic')

      if (!isAuthenticated()) {
        return createErrorResponse('unauthorized')
      }

      const body = await request.json()

      if (!body.kind || !body.value) {
        return createErrorResponse('badRequest', 'Kind and value are required')
      }

      const newContact = createContact({
        kind: body.kind,
        value: body.value,
        verified: false,
      })

      addContact(newContact)

      return HttpResponse.json({ contact: newContact }, { status: 200 })
    },
  ),

  http.post<{ id: string }, UserVerifyContactHandlerRequestBody>(
    `${MOCK_API_BASE_URL}/user/contacts/:id/verify`,
    async ({ params, request }) => {
      await withDelay('realistic')

      if (!isAuthenticated()) {
        return createErrorResponse('unauthorized')
      }

      const body = await request.json()
      const contactId = params.id

      if (!body.code) {
        return createErrorResponse('badRequest', 'Verification code is required')
      }

      if (body.code !== MOCK_VERIFICATION_CODES.contact) {
        return createErrorResponse('badRequest', 'Invalid verification code')
      }

      const updated = updateContact(contactId, { verified: true })

      if (!updated) {
        return createErrorResponse('notFound', 'Contact not found')
      }

      return HttpResponse.json({ contact: updated }, { status: 200 })
    },
  ),

  http.post<{ id: string }>(
    `${MOCK_API_BASE_URL}/user/contacts/:id/delete`,
    async ({ params }) => {
      await withDelay('realistic')

      if (!isAuthenticated()) {
        return createErrorResponse('unauthorized')
      }

      const removed = removeContact(params.id)

      if (!removed) {
        return createErrorResponse('notFound', 'Contact not found')
      }

      return new HttpResponse(null, { status: 204 })
    },
  ),
]
