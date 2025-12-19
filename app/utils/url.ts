const ALLOWED_REDIRECT_HOSTS = [
  'oauth.example.com',
  'oauth.yandex.ru',
  'oauth.vk.com',
  'id.vk.com',
]

export const isValidRedirectUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url)

    if (parsed.protocol !== 'https:') {
      return false
    }

    return ALLOWED_REDIRECT_HOSTS.some(
      host => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`),
    )
  }
  catch {
    return false
  }
}

export const safeRedirect = (url: string): boolean => {
  if (!isValidRedirectUrl(url)) {
    if (import.meta.dev) {
      console.warn(`[safeRedirect] Blocked redirect to: ${url}`)
    }
    return false
  }

  window.location.href = url
  return true
}
