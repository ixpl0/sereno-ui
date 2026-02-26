interface EventWithStatuses {
  statuses: ReadonlyArray<{ status: string, created?: number, since?: number }>
}

const getStatusTimestamp = (status: { created?: number, since?: number }): number =>
  status.created ?? status.since ?? 0

export const getCurrentEventStatus = <T extends EventWithStatuses>(event: T): string => {
  if (event.statuses.length === 0) {
    return 'created'
  }
  const latest = event.statuses.reduce((max, s) =>
    getStatusTimestamp(s) > getStatusTimestamp(max) ? s : max,
  )
  return latest.status
}
