type ThemePreference = 'light' | 'system' | 'dark'
type ResolvedTheme = 'light' | 'dark'

const PREFERENCE_COOKIE_KEY = 'theme-preference'
const SYSTEM_THEME_COOKIE_KEY = 'theme-system'
const MEDIA_QUERY = '(prefers-color-scheme: dark)'

const getClientSystemTheme = (): ResolvedTheme => {
  if (import.meta.client && typeof window.matchMedia === 'function' && window.matchMedia(MEDIA_QUERY).matches) {
    return 'dark'
  }
  return 'light'
}

const parseSystemThemeHeader = (value: string | undefined): ResolvedTheme | null => {
  if (!value) {
    return null
  }

  const normalized = value.replaceAll('"', '').trim().toLowerCase()
  if (normalized === 'dark' || normalized === 'light') {
    return normalized
  }

  return null
}

export const useTheme = () => {
  const preference = useCookie<ThemePreference>(PREFERENCE_COOKIE_KEY, {
    default: () => 'system',
    watch: true,
    sameSite: 'lax',
  })

  const hintedSystemTheme = import.meta.server
    ? parseSystemThemeHeader(useRequestHeaders(['sec-ch-prefers-color-scheme'])['sec-ch-prefers-color-scheme'])
    : null

  const systemThemeCookie = useCookie<ResolvedTheme>(SYSTEM_THEME_COOKIE_KEY, {
    default: () => hintedSystemTheme ?? 'light',
    watch: true,
    sameSite: 'lax',
  })

  const systemTheme = useState<ResolvedTheme>('system-theme', () => hintedSystemTheme ?? systemThemeCookie.value ?? 'light')

  const setSystemTheme = (value: ResolvedTheme) => {
    systemTheme.value = value
    systemThemeCookie.value = value
  }

  if (import.meta.client) {
    setSystemTheme(getClientSystemTheme())
  }

  if (import.meta.server && hintedSystemTheme) {
    setSystemTheme(hintedSystemTheme)
  }

  const resolvedTheme = computed<ResolvedTheme>(() => {
    if (preference.value === 'system') {
      return systemTheme.value
    }
    return preference.value
  })

  const setPreference = (value: ThemePreference) => {
    preference.value = value
  }

  let mediaQuery: MediaQueryList | null = null

  const handleMediaChange = (event: MediaQueryListEvent) => {
    setSystemTheme(event.matches ? 'dark' : 'light')
  }

  onMounted(() => {
    if (typeof window.matchMedia !== 'function') {
      return
    }

    mediaQuery = window.matchMedia(MEDIA_QUERY)
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light')

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleMediaChange)
    }
    else {
      mediaQuery.addListener(handleMediaChange)
    }
  })

  onUnmounted(() => {
    if (mediaQuery) {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', handleMediaChange)
      }
      else {
        mediaQuery.removeListener(handleMediaChange)
      }
    }
  })

  return {
    preference: readonly(preference),
    resolvedTheme,
    setPreference,
  }
}
