export const formatDate = (timestamp: number | undefined): string => {
  if (!timestamp) {
    return ''
  }
  return new Date(timestamp * 1000).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export const formatDevice = (device: string | undefined): string => {
  if (!device) {
    return 'Неизвестное устройство'
  }
  if (device.includes('Windows')) {
    return 'Windows'
  }
  if (device.includes('Mac')) {
    return 'macOS'
  }
  if (device.includes('iPhone')) {
    return 'iPhone'
  }
  if (device.includes('Android')) {
    return 'Android'
  }
  if (device.includes('Linux')) {
    return 'Linux'
  }
  return 'Браузер'
}

export const formatContactKind = (kind: string | undefined): string => {
  if (kind === 'email') {
    return 'Email'
  }
  if (kind === 'telegram') {
    return 'Telegram'
  }
  return kind ?? ''
}
