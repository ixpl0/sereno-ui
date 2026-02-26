type ThemePreference = 'light' | 'system' | 'dark'
type ResolvedTheme = 'light' | 'dark'

const PREFERENCE_COOKIE_KEY = 'theme-preference'
const SYSTEM_THEME_COOKIE_KEY = 'theme-system'
const MEDIA_QUERY = '(prefers-color-scheme: dark)'
const YEAR_SECONDS = 60 * 60 * 24 * 365

const readCookie = (name: string): string | null => {
  const parts = document.cookie.split('; ')
  const raw = parts.find(part => part.startsWith(`${name}=`))
  if (!raw) {
    return null
  }
  return decodeURIComponent(raw.slice(name.length + 1))
}

const writeCookie = (name: string, value: string) => {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${YEAR_SECONDS}; samesite=lax`
}

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window.matchMedia === 'function' && window.matchMedia(MEDIA_QUERY).matches) {
    return 'dark'
  }
  return 'light'
}

const resolveTheme = (): ResolvedTheme => {
  const preference = readCookie(PREFERENCE_COOKIE_KEY) as ThemePreference | null
  if (preference === 'light' || preference === 'dark') {
    return preference
  }

  const systemTheme = getSystemTheme()
  writeCookie(SYSTEM_THEME_COOKIE_KEY, systemTheme)
  return systemTheme
}

const applyTheme = (theme: ResolvedTheme) => {
  document.documentElement.setAttribute('data-theme', theme)
  const root = document.getElementById('app-root')
  if (root) {
    root.setAttribute('data-theme', theme)
  }
}

export default defineNuxtPlugin(() => {
  applyTheme(resolveTheme())
})
