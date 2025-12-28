type ThemePreference = 'light' | 'system' | 'dark'
type ResolvedTheme = 'light' | 'dark'

const COOKIE_KEY = 'theme-preference'

export const useTheme = () => {
  const preference = useCookie<ThemePreference>(COOKIE_KEY, {
    default: () => 'system',
    watch: true,
  })

  const systemTheme = ref<ResolvedTheme>('dark')

  const resolvedTheme = computed<ResolvedTheme>(() => {
    if (preference.value === 'system') {
      return systemTheme.value
    }
    return preference.value
  })

  const setPreference = (value: ThemePreference) => {
    preference.value = value
  }

  onMounted(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    systemTheme.value = mediaQuery.matches ? 'dark' : 'light'

    mediaQuery.addEventListener('change', (event) => {
      systemTheme.value = event.matches ? 'dark' : 'light'
    })
  })

  return {
    preference: readonly(preference),
    resolvedTheme,
    setPreference,
  }
}
