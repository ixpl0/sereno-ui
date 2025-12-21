import { describe, it, expect, vi, beforeEach } from 'vitest'

const ALLOWED_REDIRECT_HOSTS = [
  'oauth.example.com',
  'oauth.yandex.ru',
  'oauth.vk.com',
  'id.vk.com',
]

const mockWindowLocation = {
  hostname: 'localhost',
  href: '',
}

vi.stubGlobal('window', {
  location: mockWindowLocation,
})

const isValidRedirectUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url)

    const currentHost = mockWindowLocation.hostname
    if (parsed.hostname === currentHost) {
      return true
    }

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

const safeRedirect = (url: string): boolean => {
  if (!isValidRedirectUrl(url)) {
    return false
  }
  mockWindowLocation.href = url
  return true
}

describe('isValidRedirectUrl', () => {
  beforeEach(() => {
    mockWindowLocation.hostname = 'localhost'
  })

  describe('whitelisted hosts', () => {
    it('accepts https URL with oauth.example.com', () => {
      expect(isValidRedirectUrl('https://oauth.example.com/callback')).toBe(true)
    })

    it('accepts https URL with oauth.yandex.ru', () => {
      expect(isValidRedirectUrl('https://oauth.yandex.ru/callback')).toBe(true)
    })

    it('accepts https URL with oauth.vk.com', () => {
      expect(isValidRedirectUrl('https://oauth.vk.com/callback')).toBe(true)
    })

    it('accepts https URL with id.vk.com', () => {
      expect(isValidRedirectUrl('https://id.vk.com/callback')).toBe(true)
    })

    it('accepts https URL with subdomain of whitelisted host', () => {
      expect(isValidRedirectUrl('https://auth.oauth.yandex.ru/callback')).toBe(true)
    })
  })

  describe('current domain', () => {
    it('accepts URL matching current hostname', () => {
      mockWindowLocation.hostname = 'myapp.example.com'
      expect(isValidRedirectUrl('https://myapp.example.com/dashboard')).toBe(true)
    })

    it('accepts http URL when matching current hostname', () => {
      mockWindowLocation.hostname = 'localhost'
      expect(isValidRedirectUrl('http://localhost:3000/callback')).toBe(true)
    })
  })

  describe('invalid URLs', () => {
    it('rejects http URL with whitelisted host', () => {
      expect(isValidRedirectUrl('http://oauth.yandex.ru/callback')).toBe(false)
    })

    it('rejects URL with non-whitelisted host', () => {
      expect(isValidRedirectUrl('https://evil.com/callback')).toBe(false)
    })

    it('rejects URL with similar but different domain', () => {
      expect(isValidRedirectUrl('https://oauth-yandex.ru/callback')).toBe(false)
    })

    it('rejects empty string', () => {
      expect(isValidRedirectUrl('')).toBe(false)
    })

    it('rejects relative path', () => {
      expect(isValidRedirectUrl('/callback')).toBe(false)
    })

    it('rejects invalid URL syntax', () => {
      expect(isValidRedirectUrl('not a url')).toBe(false)
    })

    it('rejects javascript protocol', () => {
      expect(isValidRedirectUrl('javascript:alert("xss")')).toBe(false)
    })

    it('rejects data protocol', () => {
      expect(isValidRedirectUrl('data:text/html,<script>alert("xss")</script>')).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('handles URL with query parameters', () => {
      expect(isValidRedirectUrl('https://oauth.yandex.ru/callback?code=123&state=abc')).toBe(true)
    })

    it('handles URL with hash fragment', () => {
      expect(isValidRedirectUrl('https://oauth.yandex.ru/callback#token=xyz')).toBe(true)
    })

    it('handles URL with port number', () => {
      expect(isValidRedirectUrl('https://oauth.yandex.ru:443/callback')).toBe(true)
    })
  })
})

describe('safeRedirect', () => {
  beforeEach(() => {
    mockWindowLocation.hostname = 'localhost'
    mockWindowLocation.href = ''
  })

  it('returns true and sets href for valid URL', () => {
    const result = safeRedirect('https://oauth.yandex.ru/callback')
    expect(result).toBe(true)
    expect(mockWindowLocation.href).toBe('https://oauth.yandex.ru/callback')
  })

  it('returns false and does not set href for invalid URL', () => {
    const result = safeRedirect('https://evil.com/callback')
    expect(result).toBe(false)
    expect(mockWindowLocation.href).toBe('')
  })

  it('returns true for current hostname URL', () => {
    mockWindowLocation.hostname = 'localhost'
    const result = safeRedirect('http://localhost:3000/dashboard')
    expect(result).toBe(true)
    expect(mockWindowLocation.href).toBe('http://localhost:3000/dashboard')
  })
})
