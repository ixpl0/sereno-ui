type ViewMode = 'cards' | 'table'

export const useViewMode = (key: string) => {
  const cookieKey = `view-mode-${key}`
  const cookie = useCookie<ViewMode>(cookieKey, {
    default: () => 'cards',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })

  const viewMode = ref<ViewMode>(cookie.value)

  const setViewMode = (mode: ViewMode) => {
    viewMode.value = mode
    cookie.value = mode
  }

  return {
    viewMode: readonly(viewMode),
    setViewMode,
  }
}
