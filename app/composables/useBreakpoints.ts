type Breakpoints = Record<string, number>

interface ThrottledFn<T extends (...args: unknown[]) => void> {
  fn: T
  cancel: () => void
}

const createThrottledFn = <T extends (...args: unknown[]) => void>(fn: T, delay: number): ThrottledFn<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastRun = 0

  const throttled = ((...args: unknown[]) => {
    const now = Date.now()

    if (now - lastRun >= delay) {
      fn(...args)
      lastRun = now
    }
    else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        fn(...args)
        lastRun = Date.now()
        timeoutId = null
      }, delay - (now - lastRun))
    }
  }) as T

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  return { fn: throttled, cancel }
}

export const useBreakpoints = <T extends Breakpoints>(breakpoints: T) => {
  const width = ref(1024)
  const isMounted = ref(false)

  const updateWidth = () => {
    width.value = window.innerWidth
  }

  const throttled = createThrottledFn(updateWidth, 100)

  onMounted(() => {
    updateWidth()
    isMounted.value = true
    window.addEventListener('resize', throttled.fn)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', throttled.fn)
    throttled.cancel()
  })

  const greater = (key: keyof T) => {
    const breakpointValue = breakpoints[key] ?? 0
    return computed(() => isMounted.value && width.value > breakpointValue)
  }

  const smaller = (key: keyof T) => {
    const breakpointValue = breakpoints[key] ?? 0
    return computed(() => isMounted.value && width.value < breakpointValue)
  }

  return {
    width: readonly(width),
    isMounted: readonly(isMounted),
    greater,
    smaller,
  }
}
