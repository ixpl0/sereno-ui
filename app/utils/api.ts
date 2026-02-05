import type { ApiResponse, ApiErrorResponse } from '~/types/api'

export const isApiError = <T>(response: ApiResponse<T>): response is ApiErrorResponse => {
  return 'error' in response && response.error !== undefined
}

export const extractApiError = (response: ApiErrorResponse, fallback: string): string => {
  const { error } = response

  if (typeof error === 'string') {
    return error
  }

  if (!error) {
    return fallback
  }

  if (error.error) {
    return String(error.error)
  }

  if (error.message) {
    return error.message
  }

  return fallback
}

export const getApiData = <T>(response: ApiResponse<T>): T | null => {
  if ('data' in response && response.data !== undefined) {
    return response.data
  }
  return null
}
