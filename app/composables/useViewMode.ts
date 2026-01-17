type ViewMode = 'cards' | 'table'

export const useViewMode = (key: string) => {
  const cookieKey = `view-mode-${key}`
  const cookie = useCookie<ViewMode>(cookieKey, {
    default: () => 'cards',
    maxAge: 60 * 60 * 24 * 365,
  })

  const viewMode = ref<ViewMode>(cookie.value)

  const setViewMode = (mode: ViewMode) => {
    viewMode.value = mode
    cookie.value = mode
  }

  const isCards = computed(() => viewMode.value === 'cards')
  const isTable = computed(() => viewMode.value === 'table')

  return {
    viewMode: readonly(viewMode),
    setViewMode,
    isCards,
    isTable,
  }
}
