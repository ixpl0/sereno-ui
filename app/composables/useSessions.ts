import { getUserSessions, postUserSessionsClose } from '~/api/sdk.gen'

export const useSessions = () => {
  const { data: response, status: fetchStatus, refresh } = useAsyncData(
    'sessions',
    async () => {
      const result = await getUserSessions()
      if (result.error) {
        throw createError({ message: 'Failed to fetch sessions' })
      }
      return result.data
    },
  )

  const sessions = computed(() => response.value?.sessions ?? [])
  const loading = computed(() => fetchStatus.value === 'pending')

  const currentSession = computed(() =>
    sessions.value.find(s => s.current === true),
  )

  const otherSessions = computed(() =>
    sessions.value.filter(s => s.current !== true),
  )

  const closeAllSessions = async () => {
    const result = await postUserSessionsClose()

    if (result.error) {
      throw createError({ message: 'Failed to close sessions' })
    }

    await refresh()
    return result
  }

  return {
    sessions,
    currentSession,
    otherSessions,
    loading,
    refresh,
    closeAllSessions,
  }
}
