type Breakpoints = Record<string, number>

export const useBreakpoints = <T extends Breakpoints>(breakpoints: T) => {
  const width = ref(1024)
  const isMounted = ref(false)

  const updateWidth = () => {
    width.value = window.innerWidth
  }

  onMounted(() => {
    updateWidth()
    isMounted.value = true
    window.addEventListener('resize', updateWidth)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateWidth)
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
