import type { ApiResponse, ApiErrorResponse } from '~/types/api'

export const isApiError = <T>(response: ApiResponse<T>): response is ApiErrorResponse => {
  return 'error' in response && response.error !== undefined
}

export const extractApiError = (response: ApiErrorResponse, fallback: string): string => {
  const { error } = response

  if (typeof error === 'string') {
    return error
  }

  if (error.message) {
    return error.message
  }

  if (error.error) {
    return error.error
  }

  return fallback
}

export const getApiData = <T>(response: ApiResponse<T>): T | null => {
  if ('data' in response && response.data !== undefined) {
    return response.data
  }
  return null
}
