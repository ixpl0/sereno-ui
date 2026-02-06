interface EventWithStatuses {
  statuses: ReadonlyArray<{ status: string, created: number }>
}

export const getCurrentEventStatus = <T extends EventWithStatuses>(event: T): string => {
  if (event.statuses.length === 0) {
    return 'created'
  }
  const latest = event.statuses.reduce((max, s) => s.created > max.created ? s : max)
  return latest.status
}
