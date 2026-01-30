export type TimelineView = 'day' | 'week' | 'month'

interface RotationData {
  days: ReadonlyArray<number>
  description: string
  duration: number
  members: ReadonlyArray<string>
  since: number
}

interface OverrideData {
  description: string
  duration: number
  member: string
  since: number
}

export interface TimelineRange {
  start: Date
  end: Date
}

export interface RotationSlot {
  memberId: string
  memberName: string
  start: Date
  end: Date
  rotationIndex: number
  isOverride: boolean
  description: string
}

const USER_COLORS = [
  'bg-primary',
  'bg-secondary',
  'bg-accent',
  'bg-info',
  'bg-success',
  'bg-warning',
  'bg-error',
]

export const getUserColor = (index: number): string => {
  return USER_COLORS[index % USER_COLORS.length] ?? USER_COLORS[0] ?? 'bg-primary'
}

export const getTimelineRange = (view: TimelineView, baseDate: Date): TimelineRange => {
  const start = new Date(baseDate)
  start.setHours(0, 0, 0, 0)

  if (view === 'day') {
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    return { start, end }
  }

  if (view === 'week') {
    const dayOfWeek = start.getDay()
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    start.setDate(start.getDate() + diffToMonday)
    const end = new Date(start)
    end.setDate(end.getDate() + 7)
    return { start, end }
  }

  start.setDate(1)
  const end = new Date(start)
  end.setMonth(end.getMonth() + 1)
  return { start, end }
}

export const getTimelineDays = (range: TimelineRange): Date[] => {
  const days: Date[] = []
  const current = new Date(range.start)

  while (current < range.end) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  return days
}

export const getTimelineHours = (range: TimelineRange): Date[] => {
  const hours: Date[] = []
  const current = new Date(range.start)

  while (current < range.end) {
    hours.push(new Date(current))
    current.setHours(current.getHours() + 1)
  }

  return hours
}

const isDayActive = (date: Date, days: ReadonlyArray<number>): boolean => {
  const dayOfWeek = date.getDay()
  const normalizedDay = dayOfWeek === 0 ? 7 : dayOfWeek
  return days.includes(normalizedDay)
}

export const calculateRotationSlots = (
  rotation: RotationData,
  range: TimelineRange,
  rotationIndex: number,
  memberNames: Map<string, string>,
): RotationSlot[] => {
  const slots: RotationSlot[] = []
  const rotationStart = new Date(rotation.since * 1000)
  const durationMs = rotation.duration * 1000

  if (rotation.members.length === 0) {
    return slots
  }

  let currentTime = new Date(rotationStart)
  let memberIndex = 0

  const totalDurationSinceStart = range.start.getTime() - rotationStart.getTime()
  if (totalDurationSinceStart > 0) {
    const totalSlots = Math.floor(totalDurationSinceStart / durationMs)
    memberIndex = totalSlots % rotation.members.length
    currentTime = new Date(rotationStart.getTime() + totalSlots * durationMs)
  }

  while (currentTime < range.end) {
    const slotEnd = new Date(currentTime.getTime() + durationMs)
    const memberId = rotation.members[memberIndex]

    if (memberId && isDayActive(currentTime, rotation.days)) {
      const effectiveStart = currentTime < range.start ? range.start : currentTime
      const effectiveEnd = slotEnd > range.end ? range.end : slotEnd

      if (effectiveStart < effectiveEnd) {
        slots.push({
          memberId,
          memberName: memberNames.get(memberId) ?? memberId,
          start: effectiveStart,
          end: effectiveEnd,
          rotationIndex,
          isOverride: false,
          description: rotation.description,
        })
      }
    }

    currentTime = slotEnd
    memberIndex = (memberIndex + 1) % rotation.members.length
  }

  return slots
}

export const calculateOverrideSlots = (
  override: OverrideData,
  range: TimelineRange,
  overrideIndex: number,
  memberNames: Map<string, string>,
): RotationSlot[] => {
  const overrideStart = new Date(override.since * 1000)
  const overrideEnd = new Date(overrideStart.getTime() + override.duration * 1000)

  if (overrideEnd <= range.start || overrideStart >= range.end) {
    return []
  }

  const effectiveStart = overrideStart < range.start ? range.start : overrideStart
  const effectiveEnd = overrideEnd > range.end ? range.end : overrideEnd

  return [{
    memberId: override.member,
    memberName: memberNames.get(override.member) ?? override.member,
    start: effectiveStart,
    end: effectiveEnd,
    rotationIndex: overrideIndex,
    isOverride: true,
    description: override.description,
  }]
}

export const formatTimeRange = (start: Date, end: Date): string => {
  const formatTime = (d: Date) => {
    const hours = d.getHours().toString().padStart(2, '0')
    const minutes = d.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const isSameDay = start.toDateString() === end.toDateString()

  if (isSameDay) {
    return `${formatTime(start)}-${formatTime(end)}`
  }

  const formatDate = (d: Date) => {
    const day = d.getDate().toString().padStart(2, '0')
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    return `${day}.${month}`
  }

  return `${formatDate(start)} ${formatTime(start)} - ${formatDate(end)} ${formatTime(end)}`
}

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours >= 24 && hours % 24 === 0) {
    const days = hours / 24
    return `${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'}`
  }

  if (hours > 0 && minutes === 0) {
    return `${hours} ч`
  }

  if (hours > 0) {
    return `${hours} ч ${minutes} мин`
  }

  return `${minutes} мин`
}

export const formatDateShort = (date: Date): string => {
  const day = date.getDate()
  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
  const month = months[date.getMonth()]
  return `${day} ${month}`
}

export const formatDayOfWeek = (date: Date): string => {
  const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
  return days[date.getDay()] ?? ''
}

export const isToday = (date: Date): boolean => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

export const getSlotPosition = (slot: RotationSlot, range: TimelineRange): { left: number, width: number } => {
  const totalMs = range.end.getTime() - range.start.getTime()
  const startOffset = slot.start.getTime() - range.start.getTime()
  const duration = slot.end.getTime() - slot.start.getTime()

  const left = (startOffset / totalMs) * 100
  const width = (duration / totalMs) * 100

  return { left, width }
}
