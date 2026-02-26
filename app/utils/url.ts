const DEFAULT_ALLOWED_HOSTS = [
  'oauth.example.com',
  'oauth.yandex.ru',
  'oauth.vk.com',
  'id.vk.com',
]

const LOCAL_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '[::1]',
])

const isLocalHost = (hostname: string): boolean => {
  return LOCAL_HOSTS.has(hostname) || hostname.endsWith('.localhost')
}

export const isValidRedirectUrl = (url: string, allowedHosts?: ReadonlyArray<string>): boolean => {
  try {
    const parsed = new URL(url)

    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return false
    }

    if (import.meta.client) {
      const currentHost = window.location.hostname
      if (parsed.hostname === currentHost) {
        if (parsed.protocol === 'https:') {
          return true
        }
        return isLocalHost(parsed.hostname)
      }
    }

    if (parsed.protocol === 'http:') {
      return isLocalHost(parsed.hostname)
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
