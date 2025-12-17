import { HttpResponse } from 'msw'
import type { ServerErrorResponse } from '~/api/types.gen'

export type ErrorType = 'badRequest' | 'unauthorized' | 'forbidden' | 'notFound' | 'serverError'

const errorStatusMap: Record<ErrorType, number> = {
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  serverError: 500,
}

const errorMessageMap: Record<ErrorType, string> = {
  badRequest: 'Invalid request',
  unauthorized: 'Unauthorized',
  forbidden: 'Access denied',
  notFound: 'Resource not found',
  serverError: 'Internal server error',
}

export const createErrorResponse = (
  type: ErrorType,
  customMessage?: string,
): ReturnType<typeof HttpResponse.json<ServerErrorResponse>> => {
  const errorBody: ServerErrorResponse = {
    error: customMessage ?? errorMessageMap[type],
    request_id: crypto.randomUUID(),
  }

  return HttpResponse.json(errorBody, { status: errorStatusMap[type] })
}

export const createValidationError = (
  field: string,
  message: string,
): ReturnType<typeof HttpResponse.json<ServerErrorResponse>> => {
  return HttpResponse.json<ServerErrorResponse>(
    {
      error: `Validation error: ${field} - ${message}`,
      request_id: crypto.randomUUID(),
    },
    { status: 400 },
  )
}
