const DEFAULT_ALLOWED_HOSTS = [
  'oauth.example.com',
  'oauth.yandex.ru',
  'oauth.vk.com',
  'id.vk.com',
]

export const isValidRedirectUrl = (url: string, allowedHosts?: ReadonlyArray<string>): boolean => {
  try {
    const parsed = new URL(url)

    if (import.meta.client) {
      const currentHost = window.location.hostname
      if (parsed.hostname === currentHost) {
        return true
      }
    }

    if (parsed.protocol !== 'https:') {
      return false
    }

    const hosts = allowedHosts ?? DEFAULT_ALLOWED_HOSTS
    return hosts.some(
      host => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`),
    )
  }
  catch {
    return false
  }
}

export const safeRedirect = (url: string, allowedHosts?: ReadonlyArray<string>): boolean => {
  if (!isValidRedirectUrl(url, allowedHosts)) {
    if (import.meta.dev) {
      console.warn(`[safeRedirect] Blocked redirect to: ${url}`)
    }
    return false
  }

  window.location.href = url
  return true
}
