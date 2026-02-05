interface EventWithStatuses {
  statuses: ReadonlyArray<{ status: string, created: number }>
}

export const getCurrentEventStatus = <T extends EventWithStatuses>(event: T): string => {
  if (event.statuses.length === 0) {
    return 'created'
  }
  const sorted = event.statuses.toSorted((a, b) => b.created - a.created)
  return sorted[0]?.status ?? 'created'
}
