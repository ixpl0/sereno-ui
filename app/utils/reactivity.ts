const SSR_WAIT_TIMEOUT = 5000

export const waitForRef = (source: Ref<string>, timeout = SSR_WAIT_TIMEOUT): Promise<void> =>
  new Promise<void>((resolve) => {
    const timer = setTimeout(() => {
      stop()
      resolve()
    }, timeout)
    const stop = watch(source, (val) => {
      if (val) {
        clearTimeout(timer)
        stop()
        resolve()
      }
    }, { flush: 'sync' })
  })
