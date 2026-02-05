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

const DEFAULT_TIMEOUT = 5000

const toastTimeouts = import.meta.client ? new Map<string, ReturnType<typeof setTimeout>>() : undefined
let toastCounter = 0

const generateToastId = (): string => {
  if (import.meta.server) {
    toastCounter += 1
    return `toast-${Date.now()}-${toastCounter}`
  }
  return crypto.randomUUID()
}

export const useToast = () => {
  const toasts = useState<ToastMessage[]>('toasts', () => [])

  const removeToast = (id: string) => {
    const timeoutId = toastTimeouts?.get(id)
    if (timeoutId) {
      clearTimeout(timeoutId)
      toastTimeouts?.delete(id)
    }
    toasts.value = toasts.value.filter(toast => toast.id !== id)
  }

  const addToast = (options: ToastOptions): string => {
    const id = generateToastId()
    const newToast: ToastMessage = {
      id,
      type: options.type ?? 'info',
      message: options.message,
      timeout: options.timeout ?? DEFAULT_TIMEOUT,
    }

    toasts.value = [...toasts.value, newToast]

    if (newToast.timeout > 0 && import.meta.client) {
      const timeoutId = setTimeout(() => {
        removeToast(id)
      }, newToast.timeout)
      toastTimeouts?.set(id, timeoutId)
    }

    return id
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
