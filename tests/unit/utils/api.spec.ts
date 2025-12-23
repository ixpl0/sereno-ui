import { describe, it, expect } from 'vitest'
import { isApiError, extractApiError, getApiData } from '~/utils/api'
import type { ApiResponse, ApiErrorResponse } from '~/types/api'

describe('isApiError', () => {
  it('returns true for response with error string', () => {
    const response: ApiResponse<string> = { error: 'Something went wrong' }
    expect(isApiError(response)).toBe(true)
  })

  it('returns true for response with error object', () => {
    const response: ApiResponse<string> = { error: { error: 'Not found', message: 'Resource not found' } }
    expect(isApiError(response)).toBe(true)
  })

  it('returns false for response with data', () => {
    const response: ApiResponse<{ id: number }> = { data: { id: 1 } }
    expect(isApiError(response)).toBe(false)
  })

  it('returns false for response with data as null', () => {
    const response: ApiResponse<null> = { data: null }
    expect(isApiError(response)).toBe(false)
  })

  it('returns false for response with data as empty string', () => {
    const response: ApiResponse<string> = { data: '' }
    expect(isApiError(response)).toBe(false)
  })

  it('returns false for response with data as zero', () => {
    const response: ApiResponse<number> = { data: 0 }
    expect(isApiError(response)).toBe(false)
  })

  it('returns false for response with data as false', () => {
    const response: ApiResponse<boolean> = { data: false }
    expect(isApiError(response)).toBe(false)
  })
})

describe('extractApiError', () => {
  it('returns error string when error is string', () => {
    const response: ApiErrorResponse = { error: 'Direct error message' }
    expect(extractApiError(response, 'fallback')).toBe('Direct error message')
  })

  it('returns error.error when error is object with error field', () => {
    const response: ApiErrorResponse = { error: { error: 'Nested error message' } }
    expect(extractApiError(response, 'fallback')).toBe('Nested error message')
  })

  it('converts number to string when error.error is number', () => {
    const response = { error: { error: 404 } } as unknown as ApiErrorResponse
    expect(extractApiError(response, 'fallback')).toBe('404')
  })

  it('returns fallback when error object has no error or message field', () => {
    const response = { error: { code: 500 } } as unknown as ApiErrorResponse
    expect(extractApiError(response, 'fallback')).toBe('fallback')
  })

  it('returns fallback when error is null', () => {
    const response = { error: null } as unknown as ApiErrorResponse
    expect(extractApiError(response, 'fallback')).toBe('fallback')
  })

  it('returns empty string when error is empty string', () => {
    const response: ApiErrorResponse = { error: '' }
    expect(extractApiError(response, 'fallback')).toBe('')
  })

  it('uses provided fallback value', () => {
    const response = { error: {} } as unknown as ApiErrorResponse
    expect(extractApiError(response, 'Custom fallback')).toBe('Custom fallback')
  })
})

describe('getApiData', () => {
  it('returns data when response has data field', () => {
    const response: ApiResponse<{ id: number }> = { data: { id: 42 } }
    expect(getApiData(response)).toEqual({ id: 42 })
  })

  it('returns null when response has error', () => {
    const response: ApiResponse<string> = { error: 'Error occurred' }
    expect(getApiData(response)).toBeNull()
  })

  it('returns null when data is undefined', () => {
    const response = {} as ApiResponse<string>
    expect(getApiData(response)).toBeNull()
  })

  it('returns null value when data is explicitly null', () => {
    const response: ApiResponse<null> = { data: null }
    expect(getApiData(response)).toBeNull()
  })

  it('returns empty string when data is empty string', () => {
    const response: ApiResponse<string> = { data: '' }
    expect(getApiData(response)).toBe('')
  })

  it('returns zero when data is zero', () => {
    const response: ApiResponse<number> = { data: 0 }
    expect(getApiData(response)).toBe(0)
  })

  it('returns false when data is false', () => {
    const response: ApiResponse<boolean> = { data: false }
    expect(getApiData(response)).toBe(false)
  })

  it('returns array when data is array', () => {
    const response: ApiResponse<number[]> = { data: [1, 2, 3] }
    expect(getApiData(response)).toEqual([1, 2, 3])
  })

  it('returns complex object when data is complex object', () => {
    const complexData = { user: { id: 1, name: 'Test' }, roles: ['admin'] }
    const response: ApiResponse<typeof complexData> = { data: complexData }
    expect(getApiData(response)).toEqual(complexData)
  })
})
