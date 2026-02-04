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
    resolved: 'Разрешён',
  }
  return statusMap[status ?? ''] ?? status ?? ''
}

const STATUS_STYLES = {
  created: { badge: 'badge-error', border: 'border-l-error', text: 'text-error', bg: 'bg-error/15' },
  acknowledged: { badge: 'badge-warning', border: 'border-l-warning', text: 'text-warning', bg: 'bg-warning/15' },
  resolved: { badge: 'badge-success', border: 'border-l-success', text: 'text-success', bg: 'bg-success/15' },
} as const

type StatusStyleKey = keyof typeof STATUS_STYLES
type StatusStyleType = keyof (typeof STATUS_STYLES)[StatusStyleKey]

const STATUS_STYLE_DEFAULTS: Record<StatusStyleType, string> = {
  badge: 'badge-ghost',
  border: 'border-l-base-content/20',
  text: 'text-base-content/60',
  bg: 'bg-base-content/10',
}

const getStatusStyle = (status: string | undefined, type: StatusStyleType): string =>
  STATUS_STYLES[status as StatusStyleKey]?.[type] ?? STATUS_STYLE_DEFAULTS[type]

export const getStatusColor = (status: string | undefined): string =>
  getStatusStyle(status, 'badge')

export const getStatusBorderColor = (status: string | undefined): string =>
  getStatusStyle(status, 'border')

export const getStatusTextColor = (status: string | undefined): string =>
  getStatusStyle(status, 'text')

export const getStatusBgLight = (status: string | undefined): string =>
  getStatusStyle(status, 'bg')

export const formatDateTimeLocal = (date: Date): string => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}
