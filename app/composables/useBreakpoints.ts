type Breakpoints = Record<string, number>

export const useBreakpoints = <T extends Breakpoints>(breakpoints: T) => {
  const width = ref(0)

  const updateWidth = () => {
    width.value = window.innerWidth
  }

  onMounted(() => {
    updateWidth()
    window.addEventListener('resize', updateWidth)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateWidth)
  })

  const greater = (key: keyof T) => {
    const breakpointValue = breakpoints[key] ?? 0
    return computed(() => width.value > breakpointValue)
  }

  const smaller = (key: keyof T) => {
    const breakpointValue = breakpoints[key] ?? 0
    return computed(() => width.value < breakpointValue)
  }

  return {
    width: readonly(width),
    greater,
    smaller,
  }
}
