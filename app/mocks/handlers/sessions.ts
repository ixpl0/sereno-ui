import { http, HttpResponse } from 'msw'
import { withDelay } from '~/mocks/utils/delay'
import { createErrorResponse } from '~/mocks/utils/error'
import { isAuthenticated, getSessions, closeOtherSessions } from '~/mocks/db'
import { MOCK_API_BASE_URL } from '~/mocks/utils/constants'

export const sessionsHandlers = [
  http.get(`${MOCK_API_BASE_URL}/user/sessions`, async () => {
    await withDelay('realistic')

    if (!isAuthenticated()) {
      return createErrorResponse('unauthorized')
    }

    const sessions = getSessions()
    return HttpResponse.json({ sessions }, { status: 200 })
  }),

  http.post(`${MOCK_API_BASE_URL}/user/sessions/close`, async () => {
    await withDelay('realistic')

    if (!isAuthenticated()) {
      return createErrorResponse('unauthorized')
    }

    closeOtherSessions()
    return new HttpResponse(null, { status: 204 })
  }),
]
