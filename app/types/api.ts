export interface ApiErrorDetail {
  error: string
  message?: string
  code?: string
  statusMessage?: string
  statusCode?: number
}

export type SdkResponse<TData, TError = unknown>
  = | { data: TData, error: undefined }
    | { data: undefined, error: TError }

export type ApiResponse<TData, TError = unknown> = SdkResponse<TData, TError>

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
