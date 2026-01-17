interface ApiMutationOptions<T> {
  onSuccess?: (data: T) => void | Promise<void>
  successMessage?: string
  errorMessage?: string
}

interface ApiResponseWithError {
  error?: unknown
  data?: unknown
}

export const useApiMutation = () => {
  const toast = useToast()

  const mutate = async <T>(
    apiCall: () => Promise<ApiResponseWithError>,
    options: ApiMutationOptions<T> = {},
  ): Promise<{ success: boolean, data?: T }> => {
    const {
      onSuccess,
      successMessage,
      errorMessage = 'Произошла ошибка',
    } = options

    try {
      const response = await apiCall()

      if ('error' in response && response.error) {
        toast.error(errorMessage)
        return { success: false }
      }

      const data = response.data as T

      if (onSuccess) {
        await onSuccess(data)
      }

      if (successMessage) {
        toast.success(successMessage)
      }

      return { success: true, data }
    }
    catch {
      toast.error(errorMessage)
      return { success: false }
    }
  }

  return { mutate }
}
