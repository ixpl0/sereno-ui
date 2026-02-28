export const formatDate = (timestamp: number | undefined): string => {
  if (timestamp === undefined) {
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
  if (timestamp === undefined) {
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

const isStatusStyleKey = (value: string | undefined): value is StatusStyleKey =>
  value !== undefined && value in STATUS_STYLES

const getStatusStyle = (status: string | undefined, type: StatusStyleType): string =>
  isStatusStyleKey(status) ? STATUS_STYLES[status][type] : STATUS_STYLE_DEFAULTS[type]

export const getStatusColor = (status: string | undefined): string =>
  getStatusStyle(status, 'badge')

export const getStatusBorderColor = (status: string | undefined): string =>
  getStatusStyle(status, 'border')

export const getStatusTextColor = (status: string | undefined): string =>
  getStatusStyle(status, 'text')

export const getStatusBgLight = (status: string | undefined): string =>
  getStatusStyle(status, 'bg')

export const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const formatTimeLocal = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

export const formatDateTimeLocal = (date: Date): string => {
  return `${formatDateLocal(date)}T${formatTimeLocal(date)}`
}

export const TIME_PICKER_MINUTE_STEP = 10

export const TIME_PICKER_OPTIONS = Array.from({ length: (24 * 60) / TIME_PICKER_MINUTE_STEP }, (_, index) => {
  const totalMinutes = index * TIME_PICKER_MINUTE_STEP
  const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0')
  const minutes = (totalMinutes % 60).toString().padStart(2, '0')
  const value = `${hours}:${minutes}`

  return {
    value,
    label: value,
  }
})

export const combineDateTimeLocal = (date: string, time: string): string => {
  if (!date || !time) {
    return ''
  }

  return `${date}T${time}`
}

export const roundDateToMinuteStep = (date: Date, stepMinutes: number): Date => {
  const next = new Date(date)
  const minute = next.getMinutes()
  const roundedMinute = Math.ceil(minute / stepMinutes) * stepMinutes

  if (roundedMinute >= 60) {
    next.setHours(next.getHours() + 1)
    next.setMinutes(0, 0, 0)
    return next
  }

  next.setMinutes(roundedMinute, 0, 0)
  return next
}
