export interface ApiSuccessResponse<T> {
  data: T
  error?: never
}

export interface ApiErrorDetail {
  error: string
  message?: string
  code?: string
  statusMessage?: string
  statusCode?: number
}

export interface ApiErrorResponse {
  data?: never
  error: ApiErrorDetail | string
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

export interface OAuthRedirectResponse {
  redirect_url: string
}

export interface UserWithLanguage {
  id: string
  first_name?: string
  last_name?: string
  timezone?: string
  language?: string
}
