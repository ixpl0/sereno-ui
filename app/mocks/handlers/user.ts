import { http, HttpResponse } from 'msw'
import type {
  UserRequestContact,
  UserRequestCode,
  UserRequestParameter,
} from '~/api/types.gen'
import { withDelay } from '~/mocks/utils/delay'
import { createErrorResponse } from '~/mocks/utils/error'
import {
  isAuthenticated,
  getCurrentUser,
  updateCurrentUser,
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
    return HttpResponse.json({
      id: user.id,
      first_name: user.firstName ?? user.name.split(' ')[0] ?? '',
      last_name: user.lastName ?? user.name.split(' ')[1] ?? '',
      timezone: user.timezone ?? 'Europe/Moscow',
    }, { status: 200 })
  }),

  http.post<never, UserRequestParameter>(
    `${MOCK_API_BASE_URL}/user/update`,
    async ({ request }) => {
      await withDelay('realistic')

      if (!isAuthenticated()) {
        return createErrorResponse('unauthorized')
      }

      const body = await request.json()

      if (!body.kind || !body.value) {
        return createErrorResponse('badRequest', 'Kind and value are required')
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
      else {
        return createErrorResponse('badRequest', 'Invalid parameter kind')
      }

      const user = updateCurrentUser(updates)
      return HttpResponse.json({
        id: user.id,
        first_name: user.firstName ?? user.name.split(' ')[0] ?? '',
        last_name: user.lastName ?? user.name.split(' ')[1] ?? '',
        timezone: user.timezone ?? 'Europe/Moscow',
      }, { status: 200 })
    },
  ),

  http.get(`${MOCK_API_BASE_URL}/user/contacts`, async () => {
    await withDelay('realistic')

    if (!isAuthenticated()) {
      return createErrorResponse('unauthorized')
    }

    const contacts = getContacts()
    return HttpResponse.json({ contacts }, { status: 200 })
  }),

  http.post<never, UserRequestContact>(
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

      return HttpResponse.json({
        contact: {
          id: newContact.id,
          kind: newContact.kind,
          value: newContact.value,
          verified: newContact.verified,
        },
      }, { status: 201 })
    },
  ),

  http.post<{ id: string }, UserRequestCode>(
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

      return HttpResponse.json({
        contact: {
          id: updated.id,
          kind: updated.kind,
          value: updated.value,
          verified: updated.verified,
        },
      }, { status: 200 })
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
