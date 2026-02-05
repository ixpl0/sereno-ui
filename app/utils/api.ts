import type { ApiErrorDetail, SdkResponse } from '~/types/api'

export const isApiError = <T, E = unknown>(
  response: SdkResponse<T, E>,
): response is { data: undefined, error: E } => {
  return response.error !== undefined
}

const isApiErrorDetail = (value: unknown): value is ApiErrorDetail => {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const obj = value as Record<string, unknown>
  return typeof obj.error === 'string' || typeof obj.message === 'string'
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

  if (isApiErrorDetail(error)) {
    if (error.error) {
      return error.error
    }
    if (error.message) {
      return error.message
    }
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
