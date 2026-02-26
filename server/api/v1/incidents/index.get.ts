import { getMockIncidents, isValidToken } from '../../../utils/mockData'

const STATUS_BY_NUMBER: Record<number, string> = {
  0: 'created',
  1: 'acknowledged',
  2: 'resolved',
}

const getStatusTimestamp = (status: { created?: number, since?: number }): number =>
  status.created ?? status.since ?? 0

const getCurrentStatus = (statuses: ReadonlyArray<{ status: string, created?: number, since?: number }>): string => {
  if (statuses.length === 0) {
    return 'created'
  }

  const latest = statuses.reduce((max, status) =>
    getStatusTimestamp(status) > getStatusTimestamp(max) ? status : max,
  )

  return latest.status
}

const normalizeStatus = (value: unknown): string | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined
  }

  if (typeof value === 'string') {
    if (value in { created: true, acknowledged: true, resolved: true }) {
      return value
    }

    const numericValue = Number(value)
    if (!Number.isNaN(numericValue)) {
      return STATUS_BY_NUMBER[numericValue]
    }
  }

  if (typeof value === 'number') {
    return STATUS_BY_NUMBER[value]
  }

  return undefined
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

  const query = getQuery(event)
  const limit = query.limit ? Number(query.limit) : undefined
  const offset = query.offset ? Number(query.offset) : undefined
  const status = normalizeStatus(query.status)

  const allIncidents = getMockIncidents().incidents
  const filteredIncidents = status
    ? allIncidents.filter(incident => getCurrentStatus(incident.statuses) === status)
    : allIncidents

  const start = offset ?? 0
  const end = limit ? start + limit : undefined

  return {
    incidents: filteredIncidents.slice(start, end),
    total: filteredIncidents.length,
  }
})
