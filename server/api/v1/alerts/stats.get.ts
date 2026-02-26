import { getMockAlerts, isValidToken } from '../../../utils/mockData'

const HOURS_IN_DAY = 24
const POINTS_COUNT = HOURS_IN_DAY + 1
const TRACKED_STATUSES = ['created', 'acknowledged', 'resolved'] as const
type TrackedStatus = typeof TRACKED_STATUSES[number]
type StatusEvent = { status: string, created?: number, since?: number }
type AlertWithStatuses = { statuses: Array<StatusEvent> }

const getStatusTimestamp = (status: { created?: number, since?: number }): number =>
  status.created ?? status.since ?? 0

const isTrackedStatus = (status: string): status is TrackedStatus =>
  TRACKED_STATUSES.includes(status as TrackedStatus)

const getStatusAtTimestamp = (
  statuses: ReadonlyArray<StatusEvent>,
  pointTimestamp: number,
): TrackedStatus | undefined => {
  let latest: TrackedStatus | undefined
  let latestTimestamp = -1

  for (const status of statuses) {
    const statusTimestamp = getStatusTimestamp(status)
    if (statusTimestamp > pointTimestamp || !isTrackedStatus(status.status)) {
      continue
    }

    if (statusTimestamp >= latestTimestamp) {
      latest = status.status
      latestTimestamp = statusTimestamp
    }
  }

  return latest
}

const hasTrackedStatusInRange = (
  statuses: ReadonlyArray<StatusEvent>,
  from: number,
  to: number,
): boolean =>
  statuses.some(status => isTrackedStatus(status.status) && getStatusTimestamp(status) >= from && getStatusTimestamp(status) <= to)

const buildStatsSeries = (
  alerts: ReadonlyArray<AlertWithStatuses>,
  timestamps: ReadonlyArray<number>,
) => {
  const rangeStart = timestamps[0]
  const rangeEnd = timestamps[timestamps.length - 1]

  const alertsInRange = alerts.filter(alert =>
    rangeStart !== undefined
    && rangeEnd !== undefined
    && hasTrackedStatusInRange(alert.statuses, rangeStart, rangeEnd),
  )

  const valuesByStatus: Record<TrackedStatus, number[]> = {
    created: [],
    acknowledged: [],
    resolved: [],
  }

  for (const pointTimestamp of timestamps) {
    const counts: Record<TrackedStatus, number> = {
      created: 0,
      acknowledged: 0,
      resolved: 0,
    }

    for (const alert of alertsInRange) {
      const status = getStatusAtTimestamp(alert.statuses, pointTimestamp)
      if (status) {
        counts[status] += 1
      }
    }

    valuesByStatus.created.push(counts.created)
    valuesByStatus.acknowledged.push(counts.acknowledged)
    valuesByStatus.resolved.push(counts.resolved)
  }

  return {
    created: {
      timestamp: [...timestamps],
      value: valuesByStatus.created,
    },
    acknowledged: {
      timestamp: [...timestamps],
      value: valuesByStatus.acknowledged,
    },
    resolved: {
      timestamp: [...timestamps],
      value: valuesByStatus.resolved,
    },
  }
}

export default defineEventHandler((event) => {
  const token = getCookie(event, 'auth_token')

  if (!isValidToken(token)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      data: { error: { code: 'unauthorized', message: 'Authentication required' } },
    })
  }

  const now = Math.floor(Date.now() / 1000)
  const firstPoint = now - (HOURS_IN_DAY * 3600)
  const timestamps = Array.from({ length: POINTS_COUNT }, (_, index) => firstPoint + (index * 3600))

  const alerts = getMockAlerts().alerts

  return buildStatsSeries(alerts, timestamps)
})
