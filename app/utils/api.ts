import type { SdkResponse } from '~/types/api'

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

  if (!error || typeof error !== 'object') {
    return fallback
  }

  const obj = error as Record<string, unknown>
  if (obj.error) {
    return String(obj.error)
  }
  if (obj.message) {
    return String(obj.message)
  }

  return fallback
}

export const getApiData = <T, E = unknown>(
  response: SdkResponse<T, E>,
): T | null => {
  if (response.data !== undefined) {
    return response.data
  }
  return null
}
