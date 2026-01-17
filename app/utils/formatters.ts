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

export const formatDateTime = (timestamp: number | undefined): string => {
  if (!timestamp) {
    return ''
  }
  return new Date(timestamp * 1000).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatStatus = (status: string | undefined): string => {
  const statusMap: Record<string, string> = {
    created: 'Создан',
    acknowledged: 'Подтверждён',
    resolved: 'Закрыт',
  }
  return statusMap[status ?? ''] ?? status ?? ''
}

export const getStatusColor = (status: string | undefined): string => {
  const colorMap: Record<string, string> = {
    created: 'badge-warning',
    acknowledged: 'badge-info',
    resolved: 'badge-success',
  }
  return colorMap[status ?? ''] ?? 'badge-ghost'
}

export const getStatusBorderColor = (status: string | undefined): string => {
  const colorMap: Record<string, string> = {
    created: 'border-l-warning border-t-warning',
    acknowledged: 'border-l-info border-t-info',
    resolved: 'border-l-success border-t-success',
  }
  return colorMap[status ?? ''] ?? 'border-l-base-content/20 border-t-base-content/20'
}
