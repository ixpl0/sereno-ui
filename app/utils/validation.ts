const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const isValidEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email.trim())
}

const TELEGRAM_REGEX = /^@?[a-zA-Z][a-zA-Z0-9_]{4,31}$/

export const isValidTelegram = (username: string): boolean => {
  return TELEGRAM_REGEX.test(username.trim())
}
