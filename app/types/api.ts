export interface ApiSuccessResponse<T> {
  data: T
  error?: never
}

export interface ApiErrorDetail {
  error: string
  message?: string
}

export interface ApiErrorResponse {
  data?: never
  error: ApiErrorDetail | string
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

export interface AuthTokenResponse {
  access_token: string
}

export interface OAuthRedirectResponse {
  redirect_url: string
}

export interface MessageResponse {
  message: string
}
