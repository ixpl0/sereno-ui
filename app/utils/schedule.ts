export type TimelineView = 'day' | 'week' | 'month'

export interface ShiftData {
  member: string
  since: number
  until: number
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
  colorIndex?: number
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

export const getWeekStart = (date: Date): Date => {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const dayOfWeek = start.getDay()
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  start.setDate(start.getDate() + diffToMonday)
  return start
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

export const convertShiftsToSlots = (
  shifts: ReadonlyArray<ShiftData>,
  description: string,
  rotationIndex: number,
  isOverride: boolean,
  memberNames: Map<string, string>,
  range: TimelineRange,
): RotationSlot[] => {
  return shifts
    .filter((shift) => {
      const shiftStart = new Date(shift.since * 1000)
      const shiftEnd = new Date(shift.until * 1000)
      return shiftEnd > range.start && shiftStart < range.end
    })
    .map((shift) => {
      const shiftStart = new Date(shift.since * 1000)
      const shiftEnd = new Date(shift.until * 1000)
      const effectiveStart = shiftStart < range.start ? range.start : shiftStart
      const effectiveEnd = shiftEnd > range.end ? range.end : shiftEnd

      return {
        memberId: shift.member,
        memberName: memberNames.get(shift.member) ?? shift.member,
        start: effectiveStart,
        end: effectiveEnd,
        rotationIndex,
        isOverride,
        description,
      }
    })
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

  if (hours >= 24 && hours % 24 === 0 && minutes === 0) {
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

export const getCurrentTimePosition = (range: TimelineRange): number | null => {
  const now = new Date()
  if (now < range.start || now > range.end) {
    return null
  }
  const totalMs = range.end.getTime() - range.start.getTime()
  const currentOffset = now.getTime() - range.start.getTime()
  return (currentOffset / totalMs) * 100
}

const MONTH_NAMES_FULL = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]

const MONTH_NAMES_GENITIVE = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
]

const MONTH_NAMES_SHORT = [
  'янв', 'фев', 'мар', 'апр', 'мая', 'июн',
  'июл', 'авг', 'сен', 'окт', 'ноя', 'дек',
]

export const formatWeekRange = (start: Date, end: Date): string => {
  const startDay = start.getDate()
  const endDay = end.getDate()
  const startMonth = start.getMonth()
  const endMonth = end.getMonth()
  const startYear = start.getFullYear()
  const endYear = end.getFullYear()

  if (startMonth === endMonth && startYear === endYear) {
    return `${startDay}-${endDay} ${MONTH_NAMES_GENITIVE[startMonth]} ${startYear}`
  }

  if (startYear === endYear) {
    return `${startDay} ${MONTH_NAMES_SHORT[startMonth]} - ${endDay} ${MONTH_NAMES_SHORT[endMonth]} ${startYear}`
  }

  return `${startDay} ${MONTH_NAMES_SHORT[startMonth]} ${startYear} - ${endDay} ${MONTH_NAMES_SHORT[endMonth]} ${endYear}`
}

export const formatMonthYear = (date: Date): string => {
  return `${MONTH_NAMES_FULL[date.getMonth()]} ${date.getFullYear()}`
}

export const formatDayFull = (date: Date): string => {
  return `${date.getDate()} ${MONTH_NAMES_GENITIVE[date.getMonth()]} ${date.getFullYear()}`
}

export interface CalendarCell {
  date: Date
  isCurrentMonth: boolean
  slots: RotationSlot[]
}

export const getCalendarCells = (
  monthDate: Date,
  allSlots: RotationSlot[],
): CalendarCell[] => {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)

  let startDayOfWeek = firstDayOfMonth.getDay()
  if (startDayOfWeek === 0) {
    startDayOfWeek = 7
  }

  const calendarStart = new Date(firstDayOfMonth)
  calendarStart.setDate(calendarStart.getDate() - (startDayOfWeek - 1))

  const cells: CalendarCell[] = []
  const current = new Date(calendarStart)

  const totalCells = 42

  for (let i = 0; i < totalCells; i++) {
    const cellDate = new Date(current)
    const dayStart = new Date(cellDate)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)

    const daySlots = allSlots.filter((slot) => {
      return slot.start < dayEnd && slot.end > dayStart
    })

    cells.push({
      date: cellDate,
      isCurrentMonth: cellDate.getMonth() === month,
      slots: daySlots,
    })

    current.setDate(current.getDate() + 1)
  }

  return cells
}
