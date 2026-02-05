import type { ApiErrorDetail, SdkResponse } from '~/types/api'

export const isApiError = <T, E = unknown>(
  response: SdkResponse<T, E>,
): response is { data: undefined, error: E } => {
  return response.error !== undefined
}

export const extractApiError = <E>(
  response: { error: E },
  fallback: string,
): string => {
  const { error } = response

  if (typeof error === 'string') {
    return error
  }

  if (!error) {
    return fallback
  }

  const errorObj = error as unknown as ApiErrorDetail
  if (errorObj.error) {
    return String(errorObj.error)
  }

  if (errorObj.message) {
    return errorObj.message
  }

  return fallback
}

export const getApiData = <T, E = unknown>(
  response: SdkResponse<T, E>,
): T | undefined => {
  if (response.data !== undefined) {
    return response.data
  }
  return undefined
}
