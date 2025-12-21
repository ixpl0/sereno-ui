import { ref, readonly } from 'vue'

export type ToastType = 'info' | 'success' | 'warning' | 'error'

export interface ToastMessage {
  id: string
  type: ToastType
  message: string
  timeout: number
}

export type ToastOptions = Partial<Omit<ToastMessage, 'id' | 'message'>> & {
  message: string
}

const toasts = ref<ToastMessage[]>([])

const DEFAULT_TIMEOUT = 5000

export const useToast = () => {
  const addToast = (options: ToastOptions): string => {
    const id = crypto.randomUUID()
    const newToast: ToastMessage = {
      id,
      type: options.type ?? 'info',
      message: options.message,
      timeout: options.timeout ?? DEFAULT_TIMEOUT,
    }

    toasts.value = [...toasts.value, newToast]

    if (newToast.timeout > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.timeout)
    }

    return id
  }

  const removeToast = (id: string) => {
    toasts.value = toasts.value.filter(toast => toast.id !== id)
  }

  const success = (message: string, timeout?: number) =>
    addToast({ message, type: 'success', timeout })

  const error = (message: string, timeout?: number) =>
    addToast({ message, type: 'error', timeout })

  const warning = (message: string, timeout?: number) =>
    addToast({ message, type: 'warning', timeout })

  const info = (message: string, timeout?: number) =>
    addToast({ message, type: 'info', timeout })

  return {
    toasts: readonly(toasts),
    toast: addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  }
}
